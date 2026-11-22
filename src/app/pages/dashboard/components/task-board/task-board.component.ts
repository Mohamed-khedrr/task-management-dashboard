import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { TaskColumn, TaskMove } from '../../../../core/models/task.model';
import { TaskDialogService } from '../../../../core/services/task-dialog.service';
import { TaskService } from '../../../../core/services/task.service';
import { TaskColumnComponent } from '../task-column/task-column.component';

// Smart part of the board: it saves moves and opens tasks, so the dashboard doesn't relay them
@Component({
  selector: 'app-task-board',
  imports: [TranslocoPipe, TaskColumnComponent, CdkDropListGroup, CdkScrollable],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskBoardComponent {
  private readonly taskService = inject(TaskService);

  protected readonly taskDialog = inject(TaskDialogService);

  readonly columns = input.required<TaskColumn[]>();

  protected moveTask(move: TaskMove) {
    this.taskService.updateStatus(move.taskId, move.status);
  }
}
