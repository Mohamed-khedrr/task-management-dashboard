import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TaskColumn } from '../../../../core/models/task.model';
import { TranslocoPipe } from '@jsverse/transloco';
import { TaskColumnComponent } from '../task-column/task-column.component';

@Component({
  selector: 'app-task-board',
  imports: [TranslocoPipe, TaskColumnComponent],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskBoardComponent {
  columns = input<TaskColumn[]>();
}
