import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { cacheInterceptor } from './cache-interceptor';

describe('cacheInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor])),
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

  it('answers a repeated GET from the cache without a second request', () => {
    http.get('/tasks').subscribe();
    backend.expectOne('/tasks').flush(['task']);

    let result: unknown;
    http.get('/tasks').subscribe((data) => (result = data));

    backend.expectNone('/tasks');
    expect(result).toEqual(['task']);
  });

  it('caches each URL and its params separately', () => {
    http.get('/tasks', { params: { status: 'todo' } }).subscribe();
    backend.expectOne('/tasks?status=todo').flush([]);

    http.get('/tasks', { params: { status: 'done' } }).subscribe();
    backend.expectOne('/tasks?status=done').flush([]);
  });

  it('fetches again after a change, so the list is never stale', () => {
    http.get('/tasks').subscribe();
    backend.expectOne('/tasks').flush([]);

    http.delete('/tasks/1').subscribe();
    backend.expectOne('/tasks/1').flush(null);

    http.get('/tasks').subscribe();
    backend.expectOne('/tasks').flush([]);
  });

  it('fetches again once the cached response is older than 5 minutes', () => {
    vi.useFakeTimers();
    http.get('/tasks').subscribe();
    backend.expectOne('/tasks').flush([]);

    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    http.get('/tasks').subscribe();
    backend.expectOne('/tasks').flush([]);
  });

  it("doesn't cache a failed request", () => {
    http.get('/tasks').subscribe({ error: vi.fn() });
    backend.expectOne('/tasks').flush('down', { status: 500, statusText: 'Server Error' });

    http.get('/tasks').subscribe();
    backend.expectOne('/tasks').flush([]);
  });
});
