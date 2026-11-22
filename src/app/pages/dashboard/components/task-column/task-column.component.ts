import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Task, TaskMove, TaskStatus } from '../../../../core/models/task.model';
import { TranslocoPipe } from '@jsverse/transloco';
import { TaskCardComponent } from '../task-card/task-card.component';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-task-column',
  imports: [TranslocoPipe, TaskCardComponent, CdkDropList, CdkDrag],
  templateUrl: './task-column.component.html',
  styleUrl: './task-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskColumnComponent {
  readonly status = input.required<TaskStatus>();
  readonly tasks = input.required<Task[]>();
  readonly deletingIds = input<string[]>([]);

  readonly taskMoved = output<TaskMove>();
  readonly taskEdit = output<Task>();
  readonly taskDelete = output<Task>();

  onDrop(e: CdkDragDrop<TaskStatus, TaskStatus, Task>) {
    if (e.previousContainer === e.container) return;
    this.taskMoved.emit({
      taskId: e.item.data.id,
      status: e.container.data,
    });
  }
}
