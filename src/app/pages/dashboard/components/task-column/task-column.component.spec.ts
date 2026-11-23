import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';
import { Task, TaskStatus } from '../../../../core/models/task.model';

import { TaskColumnComponent } from './task-column.component';

describe('TaskColumnComponent', () => {
  let component: TaskColumnComponent;
  let fixture: ComponentFixture<TaskColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskColumnComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskColumnComponent);
    fixture.componentRef.setInput('status', 'todo');
    fixture.componentRef.setInput('tasks', []);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const first = { id: 'task-1', order: 10 } as Task;
  const second = { id: 'task-2', order: 20 } as Task;
  const todo = { data: 'todo' as TaskStatus };
  const done = { data: 'done' as TaskStatus };

  function drop(task: Task, from: object, to: object, previousIndex: number, currentIndex: number) {
    return {
      previousContainer: from,
      container: to,
      item: { data: task },
      previousIndex,
      currentIndex,
    } as unknown as CdkDragDrop<TaskStatus, TaskStatus, Task>;
  }

  function listenForMoves() {
    const onMoved = vi.fn();
    component.taskMoved.subscribe(onMoved);
    return onMoved;
  }

  it('emits the new status and position when a card comes from another column', () => {
    fixture.componentRef.setInput('status', 'done');
    fixture.componentRef.setInput('tasks', [second]);
    const onMoved = listenForMoves();

    component.onDrop(drop(first, todo, done, 0, 0));

    expect(onMoved).toHaveBeenCalledWith({ taskId: 'task-1', status: 'done', order: 19 });
  });

  it('emits a new position when a card is moved inside its column', () => {
    fixture.componentRef.setInput('tasks', [first, second]);
    const onMoved = listenForMoves();

    component.onDrop(drop(first, todo, todo, 0, 1));

    expect(onMoved).toHaveBeenCalledWith({ taskId: 'task-1', status: 'todo', order: 21 });
  });

  it('ignores a card dropped back where it was', () => {
    fixture.componentRef.setInput('tasks', [first, second]);
    const onMoved = listenForMoves();

    component.onDrop(drop(first, todo, todo, 0, 0));

    expect(onMoved).not.toHaveBeenCalled();
  });
});
