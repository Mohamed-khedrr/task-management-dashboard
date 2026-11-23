import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Task, TaskColumn, TaskMove } from '../../../../core/models/task.model';
import { TaskDialogService } from '../../../../core/services/task-dialog.service';
import { TaskService } from '../../../../core/services/task.service';
import { TaskColumnComponent } from '../task-column/task-column.component';

// Smart part of the board: it saves moves and runs the card actions, so the dashboard doesn't relay them
@Component({
  selector: 'app-task-board',
  imports: [TranslocoPipe, TaskColumnComponent, CdkDropListGroup, CdkScrollable, ConfirmDialog],
  providers: [ConfirmationService],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskBoardComponent {
  private readonly taskService = inject(TaskService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly transloco = inject(TranslocoService);

  protected readonly taskDialog = inject(TaskDialogService);

  readonly columns = input.required<TaskColumn[]>();

  // The dashboard owns the list, so it moves the card in it before saving
  readonly taskMoved = output<TaskMove>();

  protected readonly deletingIds = signal<string[]>([]);

  protected confirmDelete(task: Task) {
    this.confirmation.confirm({
      header: this.transloco.translate('taskActions.deleteTitle'),
      message: this.transloco.translate('taskActions.deleteMessage', { title: task.title }),
      acceptLabel: this.transloco.translate('taskActions.delete'),
      rejectLabel: this.transloco.translate('taskActions.cancel'),
      acceptButtonProps: { severity: 'danger', size: 'small' },
      rejectButtonProps: { severity: 'secondary', text: true, size: 'small' },
      // Cancel gets focus so pressing Enter by accident doesn't delete
      defaultFocus: 'reject',
      accept: () => this.delete(task.id),
    });
  }

  // The card keeps its loader until the refreshed list no longer has it; the error interceptor shows any failure
  private delete(taskId: string) {
    this.deletingIds.update((ids) => [...ids, taskId]);
    const stopLoading = () => this.deletingIds.update((ids) => ids.filter((id) => id !== taskId));

    this.taskService.deleteTask(taskId).subscribe({ error: stopLoading });
  }
}
