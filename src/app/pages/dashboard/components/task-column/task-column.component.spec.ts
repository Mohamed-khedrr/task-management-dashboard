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

  const task = { id: 'task-1' } as Task;

  const drop = (from: { data: TaskStatus }, to: { data: TaskStatus }) =>
    ({ previousContainer: from, container: to, item: { data: task } }) as unknown as CdkDragDrop<
      TaskStatus,
      TaskStatus,
      Task
    >;

  it('emits the new status when a card is dropped from another column', () => {
    const onMoved = vi.fn();
    component.taskMoved.subscribe(onMoved);

    component['onDrop'](drop({ data: 'todo' }, { data: 'done' }));

    expect(onMoved).toHaveBeenCalledWith({ taskId: 'task-1', status: 'done' });
  });

  it('ignores a drop inside the same column', () => {
    const onMoved = vi.fn();
    component.taskMoved.subscribe(onMoved);
    const sameColumn = { data: 'todo' as TaskStatus };

    component['onDrop'](drop(sameColumn, sameColumn));

    expect(onMoved).not.toHaveBeenCalled();
  });
});
