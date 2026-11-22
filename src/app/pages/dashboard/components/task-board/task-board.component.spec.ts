import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';
import { Task } from '../../../../core/models/task.model';
import { TaskDialogService } from '../../../../core/services/task-dialog.service';
import { TaskService } from '../../../../core/services/task.service';
import { TaskColumnComponent } from '../task-column/task-column.component';
import { TaskBoardComponent } from './task-board.component';

describe('TaskBoardComponent', () => {
  let fixture: ComponentFixture<TaskBoardComponent>;
  const updateStatus = vi.fn();

  const task: Task = {
    id: 'task-1',
    title: 'Write report',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '2099-01-01',
    assignee: { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@example.com' },
    tags: [],
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  };

  const column = () => fixture.debugElement.query(By.directive(TaskColumnComponent));

  beforeEach(async () => {
    updateStatus.mockClear();

    await TestBed.configureTestingModule({
      imports: [TaskBoardComponent, getTranslocoModule()],
      providers: [{ provide: TaskService, useValue: { updateStatus } }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoardComponent);
    fixture.componentRef.setInput('columns', [{ status: 'todo', tasks: [task] }]);
    await fixture.whenStable();
  });

  it('saves the new status when a card is moved to another column', () => {
    column().componentInstance.taskMoved.emit({ taskId: 'task-1', status: 'done' });

    expect(updateStatus).toHaveBeenCalledWith('task-1', 'done');
  });

  it('opens the task form when a card is opened', () => {
    const taskDialog = TestBed.inject(TaskDialogService);

    column().componentInstance.taskOpened.emit(task);

    expect(taskDialog.isOpen()).toBe(true);
    expect(taskDialog.task()).toBe(task);
  });
});
