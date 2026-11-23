import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../testing/transloco-testing';

import { DashboardComponent } from './dashboard.component';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { Task } from '../../core/models/task.model';
import { ResourceStatus, signal } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { TaskFiltersService } from '../../core/services/task-filters.service';
import { UserService } from '../../core/services/user.service';

let nextId = 1;

const makeTask = (status: Task['status']): Task => ({
  id: `task-${nextId++}`,
  title: '',
  description: '',
  status,
  priority: 'medium',
  dueDate: '2099-01-01',
  assignee: { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@example.com' },
  tags: [],
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
});

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let element: HTMLElement;

  const tasks = signal<Task[]>([]);
  const status = signal<ResourceStatus>('resolved');
  const error = signal<unknown>(undefined);
  const reload = vi.fn();
  const userError = signal<unknown>(undefined);
  const reloadUsers = vi.fn();

  beforeEach(async () => {
    tasks.set([makeTask('todo'), makeTask('done'), makeTask('done')]);

    status.set('resolved');
    error.set(undefined);
    reload.mockClear();
    userError.set(undefined);
    reloadUsers.mockClear();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, getTranslocoModule()],
      providers: [
        {
          provide: TaskService,
          useValue: {
            tasks: { value: tasks, status, error, hasValue: () => !error(), reload },
          },
        },
        {
          provide: UserService,
          useValue: { users: { value: signal([]), error: userError, reload: reloadUsers } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  const statValues = () =>
    Array.from(element.querySelectorAll('app-stat-card .value')).map((el) =>
      el.textContent?.trim(),
    );

  it('shows the stats calculated from the loaded tasks', () => {
    expect(statValues()).toEqual(['3', '2', '0', '0']);
  });

  it('updates the stats when the tasks change', async () => {
    tasks.update((list) => [...list, makeTask('in_progress')]);
    await fixture.whenStable();

    expect(statValues()).toEqual(['4', '2', '1', '0']);
  });

  it('shows skeletons instead of the cards while loading', async () => {
    status.set('loading');
    await fixture.whenStable();

    expect(element.querySelectorAll('.stats p-skeleton').length).toBe(4);
    expect(statValues()).toEqual([]);
  });

  it('shows an error and reloads when retry is clicked', async () => {
    error.set(new Error('offline'));
    await fixture.whenStable();

    expect(statValues()).toEqual([]);
    reload.mockClear();
    element.querySelector<HTMLButtonElement>('.error button')!.click();

    expect(reload).toHaveBeenCalledOnce();
  });

  it('shows the error when the users fail to load, and reloads both on retry', async () => {
    userError.set(new Error('offline'));
    await fixture.whenStable();

    expect(element.querySelector('.error')).not.toBeNull();

    reload.mockClear();
    element.querySelector<HTMLButtonElement>('.error button')!.click();

    expect(reload).toHaveBeenCalledOnce();
    expect(reloadUsers).toHaveBeenCalledOnce();
  });

  it('places each task in the column of its status', () => {
    const cardsPerColumn = Array.from(element.querySelectorAll('app-task-column')).map(
      (column) => column.querySelectorAll('app-task-card').length,
    );

    expect(cardsPerColumn).toEqual([1, 0, 2]);
  });

  it('refreshes the tasks when the page opens', () => {
    expect(reload).toHaveBeenCalledOnce();
  });

  it('keeps showing the cards while refreshing', async () => {
    status.set('reloading');
    await fixture.whenStable();

    expect(element.querySelectorAll('.stats p-skeleton').length).toBe(0);
    expect(statValues()).toEqual(['3', '2', '0', '0']);
  });

  it('shows only the selected status column', async () => {
    TestBed.inject(TaskFiltersService).status.set('done');
    await fixture.whenStable();

    const columns = element.querySelectorAll('app-task-column');
    expect(columns.length).toBe(1);
    expect(columns[0].querySelectorAll('app-task-card').length).toBe(2);
  });

  it('keeps counting every task in the stats while filtering', async () => {
    TestBed.inject(TaskFiltersService).status.set('done');
    await fixture.whenStable();

    expect(statValues()[0]).toBe('3');
  });

  it('offers to clear filters when nothing matches, and clearing shows the board again', async () => {
    TestBed.inject(TaskFiltersService).assigneeId.set('nobody');
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('.empty-state button')!.click();
    await fixture.whenStable();

    expect(element.querySelectorAll('app-task-card').length).toBe(3);
  });

  it('invites the user to create the first task when there are none', async () => {
    tasks.set([]);
    await fixture.whenStable();

    expect(element.querySelector('app-task-board')).toBeNull();

    element.querySelector<HTMLButtonElement>('.empty-state button')!.click();

    expect(TestBed.inject(TaskDialogService).isOpen()).toBe(true);
  });
});
