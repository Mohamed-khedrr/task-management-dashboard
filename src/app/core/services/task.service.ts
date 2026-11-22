import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Task, TaskStatus } from '../models/task.model';
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

    const now = new Date().toISOString();
    const updatedTask: Task = {
      ...task,
      status,
      updatedAt: now,
      completedAt: status === 'done' ? now : undefined,
    };
    this.updateTask(updatedTask);
  }
}
