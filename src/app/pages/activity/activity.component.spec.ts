import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { ActivityComponent } from './activity.component';

const makeTask = (overrides: Partial<Task>): Task => ({
  id: 'task-1',
  title: 'Write report',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '2099-01-01',
  assignee: { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 's@x.com' },
  tags: [],
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
  ...overrides,
});

describe('ActivityComponent', () => {
  let fixture: ComponentFixture<ActivityComponent>;
  let element: HTMLElement;

  const tasks = signal<Task[]>([]);
  const isLoading = signal(false);
  const error = signal<unknown>(undefined);
  const reload = vi.fn();

  const entryCount = () => element.querySelectorAll('app-activity-feed li').length;

  beforeEach(async () => {
    tasks.set([makeTask({ id: 'a' }), makeTask({ id: 'b', updatedAt: '2026-01-05T00:00:00' })]);
    isLoading.set(false);
    error.set(undefined);
    reload.mockClear();

    await TestBed.configureTestingModule({
      imports: [ActivityComponent, getTranslocoModule()],
      providers: [
        {
          provide: TaskService,
          useValue: { tasks: { value: tasks, isLoading, error, hasValue: () => !error(), reload } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('refreshes the tasks when the page opens', () => {
    expect(reload).toHaveBeenCalledOnce();
  });

  it('lists the changes from all tasks', () => {
    expect(entryCount()).toBe(3);
  });

  it('adds new changes as the tasks change', async () => {
    tasks.update((list) => [...list, makeTask({ id: 'c' })]);
    await fixture.whenStable();

    expect(entryCount()).toBe(4);
  });

  it('shows a skeleton during the first load', async () => {
    tasks.set([]);
    isLoading.set(true);
    await fixture.whenStable();

    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('shows an empty message when there are no tasks', async () => {
    tasks.set([]);
    await fixture.whenStable();

    expect(element.querySelector('app-activity-feed')).toBeNull();
    expect(element.querySelector('.state')).not.toBeNull();
  });

  it('offers to try again after an error', async () => {
    error.set(new Error('Server error'));
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();

    expect(reload).toHaveBeenCalledTimes(2);
  });
});
