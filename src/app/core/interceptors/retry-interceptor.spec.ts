import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { retryInterceptor, withRetry } from './retry-interceptor';

describe('retryInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => retryInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  describe('with HttpClient', () => {
    let http: HttpClient;
    let backend: HttpTestingController;
    const serverError = { status: 500, statusText: 'Server Error' };

    beforeEach(() => {
      vi.useFakeTimers();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([retryInterceptor])),
          provideHttpClientTesting(),
        ],
      });
      http = TestBed.inject(HttpClient);
      backend = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      backend.verify();
      vi.useRealTimers();
    });

    it('retries a request that opts in and succeeds on a later attempt', () => {
      let result: unknown;
      http.get('/tasks', { context: withRetry() }).subscribe((data) => (result = data));

      backend.expectOne('/tasks').flush('down', serverError);
      vi.advanceTimersByTime(500);
      backend.expectOne('/tasks').flush(['task']);

      expect(result).toEqual(['task']);
    });

    it('gives up after two retries', () => {
      const onError = vi.fn();
      http.get('/tasks', { context: withRetry() }).subscribe({ error: onError });

      backend.expectOne('/tasks').flush('down', serverError);
      vi.advanceTimersByTime(500);
      backend.expectOne('/tasks').flush('down', serverError);
      vi.advanceTimersByTime(1000);
      backend.expectOne('/tasks').flush('down', serverError);

      expect(onError).toHaveBeenCalledOnce();
    });

    it('does not retry a request that did not opt in', () => {
      const onError = vi.fn();
      http.get('/tasks').subscribe({ error: onError });

      backend.expectOne('/tasks').flush('down', serverError);

      expect(onError).toHaveBeenCalledOnce();
    });

    it('does not retry a 404', () => {
      const onError = vi.fn();
      http.get('/tasks/missing', { context: withRetry() }).subscribe({ error: onError });

      backend.expectOne('/tasks/missing').flush('gone', { status: 404, statusText: 'Not Found' });

      expect(onError).toHaveBeenCalledOnce();
    });

    it('never retries a POST, even when asked to', () => {
      const onError = vi.fn();
      http.post('/tasks', {}, { context: withRetry() }).subscribe({ error: onError });

      backend.expectOne('/tasks').flush('down', serverError);

      expect(onError).toHaveBeenCalledOnce();
    });
  });
});
