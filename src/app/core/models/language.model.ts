export const APP_LANGUAGES = ['en', 'ar'] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];
