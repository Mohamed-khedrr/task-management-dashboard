import { ResourceStatus, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { Assignee, Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { AnalyticsComponent } from './analytics.component';

const sarah: Assignee = { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 's@x.com' };
const john: Assignee = { id: 'user-2', name: 'John Doe', avatar: 'JD', email: 'j@x.com' };

const makeTask = (overrides: Partial<Task>): Task => ({
  id: 'task-1',
  title: 'Write report',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '2099-01-01',
  assignee: sarah,
  tags: [],
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
  ...overrides,
});

describe('AnalyticsComponent', () => {
  let fixture: ComponentFixture<AnalyticsComponent>;
  let element: HTMLElement;

  const tasks = signal<Task[]>([]);
  const status = signal<ResourceStatus>('resolved');
  const error = signal<unknown>(undefined);
  const reload = vi.fn();

  const legendCounts = (card: number) =>
    Array.from(
      element.querySelectorAll('.charts > *')[card].querySelectorAll('.count'),
      (count) => count.textContent,
    );

  beforeEach(async () => {
    // jsdom can't draw on a canvas; the charts themselves aren't under test
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    tasks.set([
      makeTask({ status: 'todo', priority: 'high' }),
      makeTask({ status: 'done', priority: 'low' }),
      makeTask({ status: 'done', priority: 'high' }),
    ]);
    status.set('resolved');
    error.set(undefined);
    reload.mockClear();

    await TestBed.configureTestingModule({
      imports: [AnalyticsComponent, getTranslocoModule()],
      providers: [
        {
          provide: TaskService,
          useValue: { tasks: { value: tasks, status, error, hasValue: () => !error(), reload } },
        },
        { provide: UserService, useValue: { users: { value: signal([sarah, john]) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('refreshes the tasks when the page opens', () => {
    expect(reload).toHaveBeenCalledOnce();
  });

  it('counts the tasks per status and per priority', () => {
    expect(legendCounts(0)).toEqual(['1', '0', '2']);
    expect(legendCounts(1)).toEqual(['2', '0', '1']);
  });

  it('includes people with no tasks in the per-person chart', () => {
    const canvas = element.querySelectorAll('canvas')[2];

    expect(canvas.getAttribute('aria-label')).toContain('John Doe: 0 To Do, 0 In Progress, 0 Done');
  });

  it('shows skeletons during the first load', async () => {
    tasks.set([]);
    status.set('loading');
    await fixture.whenStable();

    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('shows an empty message when there are no tasks', async () => {
    tasks.set([]);
    await fixture.whenStable();

    expect(element.querySelector('.charts')).toBeNull();
    expect(element.querySelector('.state')).not.toBeNull();
  });

  it('offers to try again after an error', async () => {
    error.set(new Error('Server error'));
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();

    expect(reload).toHaveBeenCalledTimes(2);
  });
});
