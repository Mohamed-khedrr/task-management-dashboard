import { DOCUMENT, inject, Injectable, isDevMode, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { APP_LANGUAGES, AppLanguage } from '../models/language.model';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'lang';

  private readonly activeLangState = signal<AppLanguage>('en');
  readonly activeLang = this.activeLangState.asReadonly();

  init(): Promise<unknown> {
    const lang = this.readStoredLang() ?? 'en';
    this.setLanguage(lang);
    return firstValueFrom(this.transloco.load(lang));
  }

  setLanguage(lang: AppLanguage): void {
    this.transloco.setActiveLang(lang);
    this.activeLangState.set(lang);

    const html = this.document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';

    try {
      localStorage.setItem(this.storageKey, lang);
    } catch (error) {
      if (isDevMode()) console.warn('Could not persist language', error);
    }
  }

  private readStoredLang(): AppLanguage | null {
    try {
      const stored = localStorage.getItem(this.storageKey) as AppLanguage;
      return APP_LANGUAGES.includes(stored) ? stored : null;
    } catch {
      return null;
    }
  }
}
