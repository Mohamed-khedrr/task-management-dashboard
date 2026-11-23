import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { errorInterceptor, SILENT_ERRORS } from './error-interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  const add = vi.fn();

  const fail = (status: number) => {
    const onError = vi.fn();
    http.get('/tasks').subscribe({ error: onError });
    backend.expectOne('/tasks').flush('failed', { status, statusText: 'Failed' });
    return onError;
  };

  beforeEach(() => {
    add.mockClear();
    TestBed.configureTestingModule({
      imports: [getTranslocoModule()],
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: MessageService, useValue: { add } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('shows an error toast and still passes the error to the caller', () => {
    const onError = fail(500);

    expect(add).toHaveBeenCalledOnce();
    expect(add.mock.calls[0][0].severity).toBe('error');
    expect(onError).toHaveBeenCalledOnce();
  });

  it('shows a different message for each kind of failure', () => {
    for (const status of [0, 403, 404, 429, 500, 400]) {
      fail(status);
    }
    const details = add.mock.calls.map(([message]) => message.detail);

    expect(new Set(details).size).toBe(6);
  });

  it('stays quiet for a request that handles its own errors', () => {
    http
      .get('/tasks', { context: new HttpContext().set(SILENT_ERRORS, true) })
      .subscribe({ error: vi.fn() });
    backend.expectOne('/tasks').flush('failed', { status: 500, statusText: 'Failed' });

    expect(add).not.toHaveBeenCalled();
  });

  it('shows nothing for a successful request', () => {
    http.get('/tasks').subscribe();
    backend.expectOne('/tasks').flush([]);

    expect(add).not.toHaveBeenCalled();
  });
});
