import { computed, inject, Injectable, signal } from '@angular/core';
import { StatusFilter, TaskFilters, TaskPriority } from '../models/task.model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class TaskFiltersService {
  private readonly search = inject(SearchService);

  readonly status = signal<StatusFilter>('all');
  readonly priority = signal<TaskPriority | null>(null);
  readonly assigneeId = signal<string | null>(null);

  readonly criteria = computed<TaskFilters>(() => ({
    search: this.search.query(),
    priority: this.priority(),
    assigneeId: this.assigneeId(),
  }));

  readonly hasActiveFilters = computed(
    () =>
      this.search.isActive() ||
      this.status() !== 'all' ||
      this.priority() !== null ||
      this.assigneeId() !== null,
  );

  reset() {
    this.search.clear();
    this.status.set('all');
    this.priority.set(null);
    this.assigneeId.set(null);
  }
}
