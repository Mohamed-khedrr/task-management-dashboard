import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Confirmation, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { getTranslocoModule } from '../../../../../testing/transloco-testing';
import { Task } from '../../../../core/models/task.model';
import { TaskDialogService } from '../../../../core/services/task-dialog.service';
import { TaskService } from '../../../../core/services/task.service';
import { TaskColumnComponent } from '../task-column/task-column.component';
import { TaskBoardComponent } from './task-board.component';

describe('TaskBoardComponent', () => {
  let fixture: ComponentFixture<TaskBoardComponent>;
  const moveTask = vi.fn();
  const deleteTask = vi.fn();

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
    moveTask.mockClear();
    deleteTask.mockReset();
    deleteTask.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [TaskBoardComponent, getTranslocoModule()],
      providers: [{ provide: TaskService, useValue: { moveTask, deleteTask } }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoardComponent);
    fixture.componentRef.setInput('columns', [{ status: 'todo', tasks: [task] }]);
    await fixture.whenStable();
  });

  it('saves the new status and position when a card is moved', () => {
    const move = { taskId: 'task-1', status: 'done', order: 3 };
    column().componentInstance.taskMoved.emit(move);

    expect(moveTask).toHaveBeenCalledWith(move);
  });

  it('opens the task form when Edit is chosen', () => {
    const taskDialog = TestBed.inject(TaskDialogService);

    column().componentInstance.taskEdit.emit(task);

    expect(taskDialog.isOpen()).toBe(true);
    expect(taskDialog.task()).toBe(task);
  });

  it('deletes a task only when the confirmation is accepted', () => {
    const confirmation = fixture.debugElement.injector.get(ConfirmationService);
    let options: Confirmation | undefined;
    vi.spyOn(confirmation, 'confirm').mockImplementation((value) => {
      options = value;
      return confirmation;
    });

    column().componentInstance.taskDelete.emit(task);
    options!.reject?.();
    expect(deleteTask).not.toHaveBeenCalled();

    options!.accept?.();
    expect(deleteTask).toHaveBeenCalledWith('task-1');
  });
});
