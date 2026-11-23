import { MessageService } from 'primeng/api';
import { UserService } from '../../core/services/user.service';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { LanguageService } from '../../core/i18n/language.service';
import { AppLanguage } from '../../core/models/language.model';
import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let element: HTMLElement;
  const activeLang = signal<AppLanguage>('en');

  const getDrawer = () => document.querySelector<HTMLElement>('.p-drawer');

  const openMenu = async () => {
    element.querySelector<HTMLButtonElement>('.menu-button')!.click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    activeLang.set('en');

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent, getTranslocoModule()],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: LanguageService, useValue: { activeLang } },
        MessageService,
        { provide: UserService, useValue: { users: { value: signal([]) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('keeps the mobile menu closed until the menu button is clicked', async () => {
    expect(getDrawer()).toBeNull();

    await openMenu();

    expect(getDrawer()).not.toBeNull();
  });

  it('closes the mobile menu after a page is chosen', async () => {
    await openMenu();

    getDrawer()!.querySelector<HTMLAnchorElement>('a[href="/analytics"]')!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance['menuOpen']()).toBe(false);
  });

  it('opens the mobile menu from the left in English and from the right in Arabic', async () => {
    await openMenu();
    expect(getDrawer()!.classList).toContain('p-drawer-left');

    activeLang.set('ar');
    await fixture.whenStable();

    expect(getDrawer()!.classList).toContain('p-drawer-right');
  });

  it('opens an empty task form from the sidebar "+ New Task" button', async () => {
    const taskDialog = TestBed.inject(TaskDialogService);

    element.querySelector<HTMLButtonElement>('.sidebar .new-task button')!.click();
    await fixture.whenStable();

    expect(taskDialog.isOpen()).toBe(true);
    expect(taskDialog.editRequest()).toBeNull();
  });
});
