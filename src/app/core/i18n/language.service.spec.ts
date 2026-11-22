import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';

import { createMemoryStorage } from '../../../testing/memory-storage';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let transloco: TranslocoService;
  let html: HTMLElement;

  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: { test: 'Test' }, ar: { test: 'اختبار' } },
          translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' },
          preloadLangs: true,
        }),
      ],
    });
    service = TestBed.inject(LanguageService);
    transloco = TestBed.inject(TranslocoService);
    html = TestBed.inject(DOCUMENT).documentElement;
  });

  it('switches to Arabic: active lang, lang/dir attributes, storage', () => {
    service.setLanguage('ar');

    expect(transloco.getActiveLang()).toBe('ar');
    expect(service.activeLang()).toBe('ar');
    expect(html.lang).toBe('ar');
    expect(html.dir).toBe('rtl');
    expect(localStorage.getItem('lang')).toBe('ar');
    expect(transloco.translate('test')).toBe('اختبار');
  });

  it('switches from Arabic back to English with ltr direction', () => {
    service.setLanguage('ar');
    service.setLanguage('en');

    expect(transloco.getActiveLang()).toBe('en');
    expect(service.activeLang()).toBe('en');
    expect(html.lang).toBe('en');
    expect(html.dir).toBe('ltr');
    expect(localStorage.getItem('lang')).toBe('en');
    expect(transloco.translate('test')).toBe('Test');
  });

  it('init() restores a persisted language and ignores invalid values', async () => {
    localStorage.setItem('lang', 'ar');
    await service.init();
    expect(service.activeLang()).toBe('ar');

    localStorage.setItem('lang', 'fr');
    await service.init();
    expect(service.activeLang()).toBe('en');
  });

  afterEach(() => vi.unstubAllGlobals());
});
