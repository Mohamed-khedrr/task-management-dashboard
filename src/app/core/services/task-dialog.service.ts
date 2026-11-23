import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TaskDialogService {
  readonly isOpen = signal(false);

  // A new object on every open, so the dialog loads the task again even when it's the same one
  readonly editRequest = signal<{ taskId: string } | null>(null);

  openCreate() {
    this.editRequest.set(null);
    this.isOpen.set(true);
  }

  openEdit(taskId: string) {
    this.editRequest.set({ taskId });
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }
}
