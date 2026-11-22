import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);

function errorKey(error: HttpErrorResponse): string {
  if (error.status === 0) return 'errors.network';
  if (error.status === 401 || error.status === 403) return 'errors.forbidden';
  if (error.status === 404) return 'errors.notFound';
  if (error.status === 408 || error.status === 429) return 'errors.tryAgain';
  if (error.status >= 500) return 'errors.server';
  return 'errors.unknown';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messages = inject(MessageService);
  const transloco = inject(TranslocoService);

  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && !req.context.get(SILENT_ERRORS)) {
        messages.add({
          severity: 'error',
          summary: transloco.translate('errors.title'),
          detail: transloco.translate(errorKey(err)),
        });
      }
      return throwError(() => err);
    }),
  );
};
