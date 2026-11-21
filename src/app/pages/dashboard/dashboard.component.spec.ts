import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../testing/transloco-testing';

import { DashboardComponent } from './dashboard.component';
import { Task } from '../../core/models/task.model';
import { signal } from '@angular/core';
import { TaskService } from '../../core/services/task.service';

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
  const isLoading = signal(false);
  const error = signal<unknown>(undefined);
  const reload = vi.fn();

  beforeEach(async () => {
    tasks.set([makeTask('todo'), makeTask('done'), makeTask('done')]);

    isLoading.set(false);
    error.set(undefined);
    reload.mockClear();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, getTranslocoModule()],
      providers: [
        {
          provide: TaskService,
          useValue: {
            tasks: { value: tasks, isLoading, error, hasValue: () => !error(), reload },
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
    isLoading.set(true);
    await fixture.whenStable();

    expect(element.querySelectorAll('p-skeleton').length).toBe(4);
    expect(statValues()).toEqual([]);
  });

  it('shows an error and reloads when retry is clicked', async () => {
    error.set(new Error('offline'));
    await fixture.whenStable();

    expect(statValues()).toEqual([]);
    element.querySelector<HTMLButtonElement>('.error button')!.click();

    expect(reload).toHaveBeenCalledOnce();
  });
});
