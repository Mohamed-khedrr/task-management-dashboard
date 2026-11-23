import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { RequestCacheService } from '../services/request-cache.service';
import { finalize, of, tap } from 'rxjs';

/**
 * Serves repeated GET requests from {@link RequestCacheService} for a few minutes.
 * Any other method changes data on the server, so it clears the whole cache when it starts
 * and again when it finishes: a list read while the change was in flight can't stay cached.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(RequestCacheService);
  if (req.method !== 'GET') {
    cache.clear();
    return next(req).pipe(finalize(() => cache.clear()));
  }

  const cached = cache.get(req.urlWithParams);
  if (cached) return of(cached.clone());

  return next(req).pipe(
    tap((e) => {
      if (e instanceof HttpResponse) cache.set(req.urlWithParams, e);
    }),
  );
};
