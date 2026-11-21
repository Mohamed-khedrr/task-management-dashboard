import { Task } from '../models/task.model';
import { computeTaskStats, isTaskOverdue } from './task.utils';

const today = new Date(2026, 10, 21);

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Write report',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-11-25',
    assignee: { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@example.com' },
    tags: [],
    createdAt: '2026-11-01T10:00:00',
    updatedAt: '2026-11-01T10:00:00',
    ...overrides,
  };
}

describe('isTaskOverdue', () => {
  it('is overdue when not done and due before today', () => {
    expect(isTaskOverdue(makeTask({ dueDate: '2026-11-20' }), today)).toBe(true);
  });

  it('is not overdue when due today', () => {
    expect(isTaskOverdue(makeTask({ dueDate: '2026-11-21' }), today)).toBe(false);
  });

  it('is never overdue once done, and ignores the isOverdue field', () => {
    const task = makeTask({ status: 'done', dueDate: '2026-11-01', isOverdue: true });
    expect(isTaskOverdue(task, today)).toBe(false);
  });
});

describe('computeTaskStats', () => {
  it('counts totals and the calculated change lines', () => {
    const stats = computeTaskStats(
      [
        makeTask({ createdAt: '2026-11-19T09:00:00' }),
        makeTask({ status: 'done', completedAt: '2026-11-21T08:00:00' }),
        makeTask({ status: 'done', completedAt: '2026-11-15T08:00:00' }),
        makeTask({ status: 'in_progress', priority: 'high' }),
        makeTask({ dueDate: '2026-11-20' }),
        makeTask({ dueDate: '2026-11-10' }),
      ],
      today,
    );

    expect(stats).toEqual({
      total: 6,
      createdThisWeek: 1,
      completed: 2,
      completedToday: 1,
      inProgress: 1,
      inProgressHighPriority: 1,
      overdue: 2,
      overdueSinceToday: 1,
    });
  });

  it('returns zeros for an empty list', () => {
    expect(computeTaskStats([], today).total).toBe(0);
  });
});
