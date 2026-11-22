import { Injectable, signal } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskDialogService {
  readonly isOpen = signal(false);
  readonly task = signal<Task | null>(null);

  openCreate() {
    this.task.set(null);
    this.isOpen.set(true);
  }

  openEdit(task: Task) {
    this.task.set(task);
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }
}
