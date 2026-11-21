import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import ar from '../../public/i18n/ar.json';
import en from '../../public/i18n/en.json';

export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { en, ar },
    translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' },
    preloadLangs: true,
    ...options,
  });
}
