import { TestBed } from '@angular/core/testing';

import { TaskFiltersService } from './task-filters.service';

describe('TaskFiltersService', () => {
  let service: TaskFiltersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskFiltersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('reports active filters and clears them all on reset', () => {
    expect(service.hasActiveFilters()).toBe(false);

    service.search.set('report');
    service.status.set('done');
    expect(service.hasActiveFilters()).toBe(true);

    service.reset();
    expect(service.hasActiveFilters()).toBe(false);
    expect(service.status()).toBe('all');
  });

  it('ignores a search made only of spaces', () => {
    service.search.set('   ');

    expect(service.hasActiveFilters()).toBe(false);
  });

  it('applies a search only after typing pauses', () => {
    vi.useFakeTimers();
    service.search.set('report');
    TestBed.tick();

    vi.advanceTimersByTime(299);
    expect(service.criteria().search).toBe('');

    vi.advanceTimersByTime(1);
    expect(service.criteria().search).toBe('report');
    vi.useRealTimers();
  });

  it('applies clearing the search immediately', () => {
    vi.useFakeTimers();
    service.search.set('report');
    TestBed.tick();
    vi.advanceTimersByTime(300);

    service.search.set('');
    TestBed.tick();

    expect(service.criteria().search).toBe('');
    vi.useRealTimers();
  });
});
