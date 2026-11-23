import { TestBed } from '@angular/core/testing';

import { SearchService } from './search.service';
import { TaskFiltersService } from './task-filters.service';

describe('TaskFiltersService', () => {
  let service: TaskFiltersService;
  let search: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskFiltersService);
    search = TestBed.inject(SearchService);
  });

  it('reports active filters and clears them all on reset, including the search', () => {
    expect(service.hasActiveFilters()).toBe(false);

    search.text.set('report');
    service.status.set('done');
    expect(service.hasActiveFilters()).toBe(true);

    service.reset();
    expect(service.hasActiveFilters()).toBe(false);
    expect(service.status()).toBe('all');
    expect(search.text()).toBe('');
  });

  it('ignores a search made only of spaces', () => {
    search.text.set('   ');

    expect(service.hasActiveFilters()).toBe(false);
  });
});
