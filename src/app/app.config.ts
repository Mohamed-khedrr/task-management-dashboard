import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideI18n } from './core/i18n/i18n.providers';
import { provideTheme } from './core/theme/theme.providers';
import { cacheInterceptor } from './core/interceptors/cache-interceptor';
import { retryInterceptor } from './core/interceptors/retry-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor, retryInterceptor])),
    MessageService,
    provideI18n(),
    provideTheme(),
  ],
};
