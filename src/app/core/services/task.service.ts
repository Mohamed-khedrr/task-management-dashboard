import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/tasks`;
  readonly tasks = httpResource<Task[]>(() => `${environment.apiUrl}/tasks`, { defaultValue: [] });

  updateTask(updatedTask: Task) {
    const prevTasks = this.tasks.value();
    this.tasks.update((tasks) => tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));

    this.http.put<Task>(`${this.url}/${updatedTask.id}`, updatedTask).subscribe({
      error: () => {
        this.tasks.set(prevTasks);
        // Handle Toast to show err message
      },
    });
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
