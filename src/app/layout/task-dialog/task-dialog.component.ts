import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TaskDraft } from '../../core/models/task.model';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { TaskFormComponent } from '../../pages/dashboard/components/task-form/task-form.component';

@Component({
  selector: 'app-task-dialog',
  imports: [Dialog, ButtonModule, MessageModule, ProgressSpinner, TaskFormComponent, TranslocoPipe],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDialogComponent {
  private readonly taskService = inject(TaskService);

  protected readonly dialog = inject(TaskDialogService);
  protected readonly users = inject(UserService).users;

  // Edit loads the latest version of the task from the server, not the copy on the board
  protected readonly task = this.taskService.createTaskResource(this.dialog.editRequest);

  protected readonly isSaving = signal(false);

  protected onVisibleChange(visible: boolean) {
    if (!visible) {
      this.dialog.close();
    }
  }

  protected save(draft: TaskDraft) {
    if (this.isSaving()) {
      return;
    }

    const task = this.task.value();
    const request = task
      ? this.taskService.saveTask(task, draft)
      : this.taskService.createTask(draft);

    this.isSaving.set(true);
    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.dialog.close();
      },
      // The error interceptor shows the toast and the dialog stays open to try again
      error: () => this.isSaving.set(false),
    });
  }
}
