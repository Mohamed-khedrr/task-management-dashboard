import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TranslocoPipe } from '@jsverse/transloco';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-task-column',
  imports: [TranslocoPipe, TaskCardComponent],
  templateUrl: './task-column.component.html',
  styleUrl: './task-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskColumnComponent {
  readonly status = input.required<TaskStatus>();
  readonly tasks = input.required<Task[]>();
}
