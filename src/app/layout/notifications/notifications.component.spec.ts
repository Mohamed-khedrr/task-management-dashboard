import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { LanguageService } from '../../core/i18n/language.service';
import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let fixture: ComponentFixture<NotificationsComponent>;
  let element: HTMLElement;

  const bell = () => element.querySelector<HTMLButtonElement>('.bell')!;
  const badge = () => element.querySelector('.badge');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent, getTranslocoModule()],
      providers: [{ provide: LanguageService, useValue: { activeLang: signal('en') } }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows how many notifications are unread on the bell', () => {
    expect(badge()?.textContent?.trim()).toBe('2');
    expect(bell().getAttribute('aria-label')).toContain('2');
  });

  it('clears the unread count when everything is marked as read', async () => {
    fixture.componentInstance['markAllAsRead']();
    await fixture.whenStable();

    expect(badge()).toBeNull();
    expect(bell().getAttribute('aria-label')).not.toContain('2');
  });

  it('starts closed', () => {
    expect(bell().getAttribute('aria-expanded')).toBe('false');
  });
});
