import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { SidebarNavComponent } from './sidebar-nav.component';

describe('SidebarNavComponent', () => {
  let fixture: ComponentFixture<SidebarNavComponent>;
  let element: HTMLElement;

  const getLink = (href: string) => element.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavComponent, getTranslocoModule()],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarNavComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('highlights only the link of the current page', async () => {
    await TestBed.inject(Router).navigateByUrl('/tasks');
    await fixture.whenStable();

    expect(getLink('/tasks').classList).toContain('nav-link--active');
    expect(getLink('/dashboard').classList).not.toContain('nav-link--active');
  });

  it('emits linkSelected when a link is clicked', () => {
    const onLinkSelected = vi.fn();
    fixture.componentInstance.linkSelected.subscribe(onLinkSelected);

    getLink('/tasks').click();

    expect(onLinkSelected).toHaveBeenCalledOnce();
  });
});
