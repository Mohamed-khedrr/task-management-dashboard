import { Signal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { Task, TaskDraft } from '../../core/models/task.model';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { TaskFormComponent } from '../../pages/dashboard/components/task-form/task-form.component';
import { TaskDialogComponent } from './task-dialog.component';

describe('TaskDialogComponent', () => {
  let fixture: ComponentFixture<TaskDialogComponent>;
  let dialog: TaskDialogService;
  let request: Subject<unknown>;

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
  const draft = { title: 'Plan the sprint' } as TaskDraft;

  const createTask = vi.fn();
  const saveTask = vi.fn();
  const reloadTask = vi.fn();
  const loadState = signal<'loaded' | 'loading' | 'error'>('loaded');

  // Stands in for the edit resource: it has the task once an edit was requested and loaded
  const createTaskResource = (editRequest: Signal<{ taskId: string } | null>) => ({
    value: () => (editRequest() && loadState() === 'loaded' ? task : undefined),
    hasValue: () => !!editRequest() && loadState() === 'loaded',
    error: () => (loadState() === 'error' ? new Error('down') : undefined),
    reload: reloadTask,
  });

  const form = () => fixture.debugElement.query(By.directive(TaskFormComponent));

  const open = async (taskToEdit: Task | null) => {
    if (taskToEdit) {
      dialog.openEdit(taskToEdit.id);
    } else {
      dialog.openCreate();
    }
    await fixture.whenStable();
  };

  const emitSave = async () => {
    form().componentInstance.saved.emit(draft);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    request = new Subject();
    loadState.set('loaded');
    reloadTask.mockClear();
    for (const spy of [createTask, saveTask]) {
      spy.mockReset();
      spy.mockReturnValue(request);
    }

    await TestBed.configureTestingModule({
      imports: [TaskDialogComponent, getTranslocoModule()],
      providers: [
        { provide: TaskService, useValue: { createTask, saveTask, createTaskResource } },
        { provide: UserService, useValue: { users: { value: signal([]) } } },
      ],
    }).compileComponents();

    dialog = TestBed.inject(TaskDialogService);
    dialog.close();
    fixture = TestBed.createComponent(TaskDialogComponent);
    await fixture.whenStable();
  });

  it('creates a task and closes only after the request succeeds', async () => {
    await open(null);

    await emitSave();

    expect(createTask).toHaveBeenCalledWith(draft);
    expect(dialog.isOpen()).toBe(true);
    expect(form().componentInstance.saving()).toBe(true);

    request.next({});
    request.complete();
    await fixture.whenStable();

    expect(dialog.isOpen()).toBe(false);
  });

  it('saves the edited task', async () => {
    await open(task);

    await emitSave();

    expect(saveTask).toHaveBeenCalledWith(task, draft);
  });

  it('does not send a second request while one is pending', async () => {
    await open(null);

    await emitSave();
    await emitSave();

    expect(createTask).toHaveBeenCalledTimes(1);
  });

  it('stays open and can save again when the request fails', async () => {
    await open(null);
    await emitSave();

    request.error(new Error('Server error'));
    await fixture.whenStable();

    expect(dialog.isOpen()).toBe(true);
    expect(form().componentInstance.saving()).toBe(false);
  });

  it('shows a loader instead of the form while the task loads', async () => {
    loadState.set('loading');
    await open(task);

    expect(form()).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('offers to load the task again when loading fails', async () => {
    loadState.set('error');
    await open(task);

    expect(form()).toBeNull();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[role="alert"] button')!
      .click();

    expect(reloadTask).toHaveBeenCalledOnce();
  });
});
