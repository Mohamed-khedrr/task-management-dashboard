import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';
import { Task, TaskDraft, TaskMove } from '../models/task.model';
import { withRetry } from '../interceptors/retry-interceptor';
import { SILENT_ERRORS } from '../interceptors/error-interceptor';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/tasks`;

  // Silent: the pages show their own error with a Retry button, so a toast would repeat it
  readonly tasks = httpResource<Task[]>(
    () => ({
      url: this.url,
      context: withRetry().set(SILENT_ERRORS, true),
    }),
    { defaultValue: [] },
  );

  /**
   * Saves a drag and drop. Optimistic: the board changes right away, so the card
   * doesn't jump back while waiting, and the task goes back to how it was if the
   * server rejects the change. A move inside the same column only changes the
   * order, so it doesn't count as an edit and keeps `updatedAt`.
   */
  moveTask(move: TaskMove) {
    const task = this.tasks.value().find((t) => t.id === move.taskId);
    if (!task) {
      return;
    }

    let movedTask: Task;
    if (task.status === move.status) {
      movedTask = { ...task, order: move.order };
    } else {
      movedTask = { ...this.applyChanges(task, { status: move.status }), order: move.order };
    }
    this.replaceTask(movedTask);

    this.http
      .put<Task>(`${this.url}/${task.id}`, movedTask, { context: withRetry() })
      .subscribe({ error: () => this.replaceTask(task) });
  }

  private replaceTask(updatedTask: Task) {
    this.tasks.update((list) =>
      list.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  }

  /** Adds the task to the list only after the server returns it with its id. */
  createTask(draft: TaskDraft) {
    const now = new Date().toISOString();
    const newTask: Omit<Task, 'id'> = {
      ...draft,
      createdAt: now,
      updatedAt: now,
      completedAt: draft.status === 'done' ? now : undefined,
    };

    return this.http
      .post<Task>(this.url, newTask)
      .pipe(tap((created) => this.addCreatedTask(created)));
  }

  /**
   * The sidebar's New Task button stays usable when the list failed to load. The list has
   * no value then and updating it would throw, turning a successful create into an error
   * (and a duplicate on retry), so the list is loaded again instead.
   */
  private addCreatedTask(created: Task) {
    if (this.tasks.hasValue()) {
      this.tasks.update((list) => [created, ...list]);
    } else {
      this.tasks.reload();
    }
  }

  saveTask(task: Task, changes: TaskDraft) {
    return this.http
      .put<Task>(`${this.url}/${task.id}`, this.applyChanges(task, changes), {
        context: withRetry(),
      })
      .pipe(tap((saved) => this.replaceTask(saved)));
  }

  deleteTask(taskId: string) {
    return this.http
      .delete<void>(`${this.url}/${taskId}`, { context: withRetry() })
      .pipe(tap(() => this.tasks.update((list) => list.filter((t) => t.id !== taskId))));
  }

  /**
   * Merges form changes into a task and keeps the dates consistent:
   * `updatedAt` is always now, and `completedAt` is set when the task becomes done,
   * kept while it stays done and cleared when it's reopened.
   */
  private applyChanges(task: Task, changes: Partial<TaskDraft>): Task {
    const now = new Date().toISOString();
    const status = changes.status ?? task.status;

    let completedAt: string | undefined;
    if (status === 'done') {
      completedAt = task.status === 'done' ? task.completedAt : now;
    }

    return { ...task, ...changes, updatedAt: now, completedAt };
  }
}
