import { Task } from '../models/task.model';
import {
  computeTaskStats,
  countByAssigneeAndStatus,
  countByField,
  countOverdueByAssignee,
} from './task-stats.utils';

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

describe('countByField', () => {
  const tasks = [
    makeTask({ status: 'todo', priority: 'high' }),
    makeTask({ status: 'done', priority: 'high' }),
    makeTask({ status: 'done', priority: 'low' }),
  ];

  it('counts tasks per status', () => {
    const counts = countByField(tasks, 'status');

    expect(counts.get('todo')).toBe(1);
    expect(counts.get('done')).toBe(2);
    expect(counts.get('in_progress')).toBeUndefined();
  });

  it('counts tasks per priority', () => {
    const counts = countByField(tasks, 'priority');

    expect(counts.get('high')).toBe(2);
    expect(counts.get('low')).toBe(1);
  });
});

describe('countByAssigneeAndStatus', () => {
  const john = { id: 'user-2', name: 'John Doe', avatar: 'JD', email: 'john@example.com' };

  it("counts each person's tasks per status", () => {
    const counts = countByAssigneeAndStatus([
      makeTask({ status: 'todo' }),
      makeTask({ status: 'done' }),
      makeTask({ status: 'done' }),
      makeTask({ status: 'in_progress', assignee: john }),
    ]);

    expect(counts.get('user-1')).toEqual({ todo: 1, in_progress: 0, done: 2 });
    expect(counts.get('user-2')).toEqual({ todo: 0, in_progress: 1, done: 0 });
  });

  it('leaves out people with no tasks', () => {
    expect(countByAssigneeAndStatus([makeTask()]).has('user-3')).toBe(false);
  });
});

describe('countOverdueByAssignee', () => {
  const john = { id: 'user-2', name: 'John Doe', avatar: 'JD', email: 'john@example.com' };

  it('counts only overdue open tasks per person', () => {
    const counts = countOverdueByAssignee(
      [
        makeTask({ dueDate: '2026-11-20' }),
        makeTask({ dueDate: '2026-11-10' }),
        makeTask({ dueDate: '2026-11-10', status: 'done' }),
        makeTask({ dueDate: '2026-11-30', assignee: john }),
      ],
      today,
    );

    expect(counts.get('user-1')).toBe(2);
    expect(counts.has('user-2')).toBe(false);
  });
});
