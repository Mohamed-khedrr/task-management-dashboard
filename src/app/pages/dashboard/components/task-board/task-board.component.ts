import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TaskColumn, TaskMove } from '../../../../core/models/task.model';
import { TranslocoPipe } from '@jsverse/transloco';
import { TaskColumnComponent } from '../task-column/task-column.component';

@Component({
  selector: 'app-task-board',
  imports: [TranslocoPipe, TaskColumnComponent, CdkDropListGroup, CdkScrollable],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskBoardComponent {
  readonly columns = input.required<TaskColumn[]>();

  readonly taskMoved = output<TaskMove>();
}
