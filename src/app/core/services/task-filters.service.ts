import { computed, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounce, of, timer } from 'rxjs';
import { StatusFilter, TaskFilters, TaskPriority } from '../models/task.model';

const SEARCH_DEBOUNCE_MS = 300;

@Injectable({
  providedIn: 'root',
})
export class TaskFiltersService {
  readonly search = signal('');
  readonly status = signal<StatusFilter>('all');
  readonly priority = signal<TaskPriority | null>(null);
  readonly assigneeId = signal<string | null>(null);

  // Typing waits for a pause before filtering; clearing the search applies at once
  private readonly debouncedSearch = toSignal(
    toObservable(computed(() => this.search().trim())).pipe(
      debounce((value) => (value ? timer(SEARCH_DEBOUNCE_MS) : of(value))),
    ),
    { initialValue: '' },
  );

  readonly criteria = computed<TaskFilters>(() => ({
    search: this.debouncedSearch(),
    priority: this.priority(),
    assigneeId: this.assigneeId(),
  }));

  readonly hasActiveFilters = computed(
    () =>
      this.search().trim() !== '' ||
      this.status() !== 'all' ||
      this.priority() !== null ||
      this.assigneeId() !== null,
  );

  reset() {
    this.search.set('');
    this.status.set('all');
    this.priority.set(null);
    this.assigneeId.set(null);
  }
}
