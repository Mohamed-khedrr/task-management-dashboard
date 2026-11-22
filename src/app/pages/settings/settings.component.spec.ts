import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { createMemoryStorage } from '../../../testing/memory-storage';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { LanguageService } from '../../core/i18n/language.service';
import { AppLanguage } from '../../core/models/language.model';
import { ProfileService } from '../../core/services/profile.service';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let element: HTMLElement;
  let profile: ProfileService;
  const setLanguage = vi.fn();

  const nameInput = () => element.querySelector<HTMLInputElement>('#settings-name')!;

  const type = async (value: string) => {
    nameInput().value = value;
    nameInput().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const submit = async () => {
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  };

  // The language switch is a PrimeNG widget, so it's changed through the form
  const chooseLanguage = (lang: AppLanguage) => {
    fixture.componentInstance['form'].controls.language.setValue(lang);
  };

  beforeEach(async () => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    setLanguage.mockClear();

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, getTranslocoModule()],
      providers: [
        MessageService,
        { provide: LanguageService, useValue: { activeLang: signal('en'), setLanguage } },
      ],
    }).compileComponents();

    profile = TestBed.inject(ProfileService);
    profile.setName('Sarah Smith');

    fixture = TestBed.createComponent(SettingsComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('starts with the saved name', () => {
    expect(nameInput().value).toBe('Sarah Smith');
  });

  it('saves the name and the language', async () => {
    await type('Mohamed Khedr');
    chooseLanguage('ar');

    await submit();

    expect(profile.name()).toBe('Mohamed Khedr');
    expect(setLanguage).toHaveBeenCalledWith('ar');
  });

  it('does not save an empty name', async () => {
    await type('   ');

    await submit();

    expect(profile.name()).toBe('Sarah Smith');
    expect(setLanguage).not.toHaveBeenCalled();
    expect(nameInput().getAttribute('aria-invalid')).toBe('true');
  });
});
