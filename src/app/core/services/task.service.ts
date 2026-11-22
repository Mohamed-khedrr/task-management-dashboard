import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';
import { Task, TaskDraft, TaskStatus } from '../models/task.model';
import { withRetry } from '../interceptors/retry-interceptor';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/tasks`;

  readonly tasks = httpResource<Task[]>(
    () => ({
      url: this.url,
      context: withRetry(),
    }),
    { defaultValue: [] },
  );

  /**
   * Optimistic update: the board changes right away and goes back to the previous
   * task if the server rejects the change. Used for drag and drop, where waiting
   * for the server would make the card jump back.
   */
  updateTask(updatedTask: Task) {
    const prevTask = this.tasks.value()?.find((t) => t.id === updatedTask.id);

    if (!prevTask) return;
    this.replaceTask(updatedTask);

    this.http
      .put<Task>(`${this.url}/${updatedTask.id}`, updatedTask, {
        context: withRetry(),
      })
      .subscribe({
        error: () => this.replaceTask(prevTask),
      });
  }

  private replaceTask(task: Task): void {
    this.tasks.update((list) => (list ?? []).map((t) => (t.id === task.id ? task : t)));
  }

  updateStatus(taskId: string, status: TaskStatus) {
    const task = this.tasks.value().find((t) => t.id === taskId);
    if (!task) return;

    this.updateTask(this.applyChanges(task, { status }));
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
      .pipe(tap((created) => this.tasks.update((list) => [created, ...list])));
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
