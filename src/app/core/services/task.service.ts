import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { DestroyRef, inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';
import { Task, TaskDraft, TaskStatus } from '../models/task.model';
import { withRetry } from '../interceptors/retry-interceptor';
import { SILENT_ERRORS } from '../interceptors/error-interceptor';

// Loads are retried and silent: the screens that load show their own error with a Retry button
function loadContext() {
  return withRetry().set(SILENT_ERRORS, true);
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/tasks`;

  // The task lists of the pages open right now, so a change made anywhere can refresh them
  private readonly openLists = new Set<HttpResourceRef<Task[]>>();

  /**
   * Creates the task list for a page; call it in a field initializer.
   * The list lives as long as the page: it loads when the page opens (from the cache
   * interceptor while that's fresh) and reloads after every change made in the app.
   */
  createTasksResource() {
    const tasks = httpResource<Task[]>(() => ({ url: this.url, context: loadContext() }), {
      defaultValue: [],
    });

    this.openLists.add(tasks);
    inject(DestroyRef).onDestroy(() => this.openLists.delete(tasks));
    return tasks;
  }

  /**
   * Loads the one task being edited; call it in a field initializer.
   * `editRequest` is a new object on every open, so the task loads again each time,
   * even when it's the same one. Null loads nothing.
   */
  createTaskResource(editRequest: Signal<{ taskId: string } | null>) {
    return httpResource<Task>(() => {
      const request = editRequest();
      if (!request) {
        return undefined;
      }
      return { url: `${this.url}/${request.taskId}`, context: loadContext() };
    });
  }

  createTask(draft: TaskDraft) {
    const now = new Date().toISOString();
    const newTask: Omit<Task, 'id'> = {
      ...draft,
      createdAt: now,
      updatedAt: now,
      completedAt: draft.status === 'done' ? now : undefined,
    };

    return this.http.post<Task>(this.url, newTask).pipe(tap(() => this.refreshOpenLists()));
  }

  saveTask(task: Task, changes: TaskDraft) {
    return this.http
      .put<Task>(`${this.url}/${task.id}`, this.applyChanges(task, changes), {
        context: withRetry(),
      })
      .pipe(tap(() => this.refreshOpenLists()));
  }

  /**
   * Saves a card moved on the board. Unlike the other changes it doesn't reload the open
   * lists: only the dashboard can move cards, and it has already moved the card itself.
   */
  updateStatus(task: Task, status: TaskStatus) {
    return this.http.put<Task>(`${this.url}/${task.id}`, this.applyChanges(task, { status }), {
      context: withRetry(),
    });
  }

  deleteTask(taskId: string) {
    return this.http
      .delete<void>(`${this.url}/${taskId}`, { context: withRetry() })
      .pipe(tap(() => this.refreshOpenLists()));
  }

  // reload() keeps the current list on screen while the new one loads
  private refreshOpenLists() {
    for (const list of this.openLists) {
      list.reload();
    }
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
