import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { RequestCacheService } from './request-cache.service';

describe('RequestCacheService', () => {
  let service: RequestCacheService;
  const response = new HttpResponse({ body: ['task'] });

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestCacheService);
  });

  afterEach(() => vi.useRealTimers());

  it('returns a stored response for the same URL only', () => {
    service.set('/tasks', response);

    expect(service.get('/tasks')).toBe(response);
    expect(service.get('/users')).toBeUndefined();
  });

  it('forgets a response after 5 minutes', () => {
    service.set('/tasks', response);

    vi.advanceTimersByTime(5 * 60 * 1000 - 1);
    expect(service.get('/tasks')).toBe(response);

    vi.advanceTimersByTime(2);
    expect(service.get('/tasks')).toBeUndefined();
  });

  it('forgets everything when cleared', () => {
    service.set('/tasks', response);
    service.set('/users', response);

    service.clear();

    expect(service.get('/tasks')).toBeUndefined();
    expect(service.get('/users')).toBeUndefined();
  });
});
