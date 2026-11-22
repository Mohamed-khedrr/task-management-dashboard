import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../testing/transloco-testing';

import { DashboardComponent } from './dashboard.component';
import { Task } from '../../core/models/task.model';
import { ResourceStatus, signal } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { By } from '@angular/platform-browser';
import { TaskBoardComponent } from './components/task-board/task-board.component';

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
  const updateStatus = vi.fn();

  beforeEach(async () => {
    tasks.set([makeTask('todo'), makeTask('done'), makeTask('done')]);

    status.set('resolved');
    error.set(undefined);
    reload.mockClear();
    updateStatus.mockClear();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, getTranslocoModule()],
      providers: [
        {
          provide: TaskService,
          useValue: {
            tasks: { value: tasks, status, error, hasValue: () => !error(), reload },
            updateStatus,
          },
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

  it('places each task in the column of its status', () => {
    const cardsPerColumn = Array.from(element.querySelectorAll('app-task-column')).map(
      (column) => column.querySelectorAll('app-task-card').length,
    );

    expect(cardsPerColumn).toEqual([1, 0, 2]);
  });

  it('saves the new status when a card is moved to another column', () => {
    const board = fixture.debugElement.query(By.directive(TaskBoardComponent));

    board.componentInstance.taskMoved.emit({ taskId: 'task-1', status: 'done' });

    expect(updateStatus).toHaveBeenCalledWith('task-1', 'done');
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
});
