import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Task, TaskMove, TaskStatus } from '../../../../core/models/task.model';
import { TranslocoPipe } from '@jsverse/transloco';
import { TaskCardComponent } from '../task-card/task-card.component';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { getOrderAt } from '../../../../core/utils/task.utils';

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

  onDrop(drop: CdkDragDrop<TaskStatus, TaskStatus, Task>) {
    const movedTask = drop.item.data;
    const sameColumn = drop.previousContainer === drop.container;
    if (sameColumn && drop.previousIndex === drop.currentIndex) {
      return;
    }

    const otherTasks = this.tasks().filter((task) => task.id !== movedTask.id);
    this.taskMoved.emit({
      taskId: movedTask.id,
      status: drop.container.data,
      order: getOrderAt(otherTasks, drop.currentIndex),
    });
  }
}
