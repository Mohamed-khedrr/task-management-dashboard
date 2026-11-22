import {
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

const RETRYABLE_STATUSES = new Set([0, 408, 429]);
const RETRYABLE_METHODS = new Set(['GET', 'PUT', 'DELETE']);

export const RETRY_CONTEXT = new HttpContextToken(() => false);

/**
 * Opts a request in to automatic retries.
 * @example http.get(url, { context: withRetry() })
 */
export function withRetry() {
  return new HttpContext().set(RETRY_CONTEXT, true);
}

function isRetryable(error: unknown) {
  return (
    error instanceof HttpErrorResponse &&
    (RETRYABLE_STATUSES.has(error.status) || error.status >= 500)
  );
}

/**
 * Retries opted-in requests on network errors, timeouts, rate limits and 5xx,
 * waiting 500 ms then 1 s between attempts. POST is never retried, because a
 * request that reached the server before failing would create the task twice.
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.context.get(RETRY_CONTEXT) || !RETRYABLE_METHODS.has(req.method)) return next(req);

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, attempt) =>
        isRetryable(error) ? timer(BASE_DELAY_MS * 2 ** (attempt - 1)) : throwError(() => error),
    }),
  );
};
