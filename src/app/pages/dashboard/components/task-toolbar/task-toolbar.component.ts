import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import {
  Assignee,
  StatusFilter,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskPriority,
} from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-toolbar',
  imports: [FormsModule, TranslocoPipe, ButtonModule, SelectModule],
  templateUrl: './task-toolbar.component.html',
  styleUrl: './task-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskToolbarComponent {
  readonly status = model.required<StatusFilter>();
  readonly priority = model.required<TaskPriority | null>();
  readonly assigneeId = model.required<string | null>();
  readonly users = input.required<Assignee[]>();

  readonly newTask = output<void>();

  protected readonly statusTabs: StatusFilter[] = ['all', ...TASK_STATUSES];
  protected readonly priorities = [...TASK_PRIORITIES];
}
