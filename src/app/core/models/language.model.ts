export const APP_LANGUAGES = ['en', 'ar'] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

export interface LanguageOption {
  label: string;
  value: AppLanguage;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { label: 'English', value: 'en' },
  { label: 'العربية', value: 'ar' },
];
