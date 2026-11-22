import { Task } from '../models/task.model';
import {
  computeTaskStats,
  filterTasks,
  getTaskTiming,
  groupByStatus,
  isTaskOverdue,
  sortTasks,
} from './task.utils';

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

describe('getTaskTiming', () => {
  it('counts days until due', () => {
    expect(getTaskTiming(makeTask({ dueDate: '2026-11-23' }), today)).toEqual({
      kind: 'due',
      days: 2,
    });
  });

  it('counts days past due for overdue tasks', () => {
    expect(getTaskTiming(makeTask({ dueDate: '2026-11-19' }), today)).toEqual({
      kind: 'overdue',
      days: 2,
    });
  });

  it('counts days since completion for done tasks', () => {
    const task = makeTask({ status: 'done', completedAt: '2026-11-20T15:00:00' });
    expect(getTaskTiming(task, today)).toEqual({ kind: 'completed', days: 1 });
  });
});

describe('sortTasks', () => {
  it('puts overdue first, then higher priority, then the earlier due date', () => {
    const tasks = [
      makeTask({ id: 'low', priority: 'low', dueDate: '2026-11-22' }),
      makeTask({ id: 'high-later', priority: 'high', dueDate: '2026-11-30' }),
      makeTask({ id: 'high-sooner', priority: 'high', dueDate: '2026-11-23' }),
      makeTask({ id: 'overdue', priority: 'low', dueDate: '2026-11-10' }),
    ];

    expect(sortTasks(tasks, today).map((task) => task.id)).toEqual([
      'overdue',
      'high-sooner',
      'high-later',
      'low',
    ]);
  });

  it('does not change the original array', () => {
    const tasks = [makeTask({ id: 'b', priority: 'low' }), makeTask({ id: 'a', priority: 'high' })];

    sortTasks(tasks, today);

    expect(tasks.map((task) => task.id)).toEqual(['b', 'a']);
  });
});

describe('groupByStatus', () => {
  it('returns the three columns in board order, including empty ones', () => {
    const columns = groupByStatus(
      [makeTask({ id: 'a', status: 'done' }), makeTask({ id: 'b', status: 'todo' })],
      today,
    );

    expect(columns.map((column) => column.status)).toEqual(['todo', 'in_progress', 'done']);
    expect(columns.map((column) => column.tasks.map((task) => task.id))).toEqual([
      ['b'],
      [],
      ['a'],
    ]);
  });
});

describe('filterTasks', () => {
  const noFilters = { search: '', priority: null, assigneeId: null };
  const tasks = [
    makeTask({ id: 'a', title: 'Design homepage', priority: 'high' }),
    makeTask({ id: 'b', description: 'Fix the LOGIN bug', priority: 'low' }),
    makeTask({
      id: 'c',
      assignee: { id: 'user-2', name: 'John Doe', avatar: 'JD', email: 'john@example.com' },
    }),
  ];
  const ids = (result: Task[]) => result.map((task) => task.id);

  it('returns everything when no filter is set', () => {
    expect(ids(filterTasks(tasks, noFilters))).toEqual(['a', 'b', 'c']);
  });

  it('searches title and description, ignoring case and surrounding spaces', () => {
    expect(ids(filterTasks(tasks, { ...noFilters, search: ' design ' }))).toEqual(['a']);
    expect(ids(filterTasks(tasks, { ...noFilters, search: 'login' }))).toEqual(['b']);
  });

  it('filters by priority and by assignee', () => {
    expect(ids(filterTasks(tasks, { ...noFilters, priority: 'high' }))).toEqual(['a']);
    expect(ids(filterTasks(tasks, { ...noFilters, assigneeId: 'user-2' }))).toEqual(['c']);
  });

  it('combines filters', () => {
    expect(filterTasks(tasks, { ...noFilters, search: 'design', priority: 'low' })).toEqual([]);
  });
});
