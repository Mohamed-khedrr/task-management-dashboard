import { Task } from '../models/task.model';
import { filterTasks, getOrderAt, getTaskTiming, groupByStatus, isTaskOverdue } from './task.utils';

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

describe('groupByStatus', () => {
  it('returns the three columns in board order, including empty ones', () => {
    const columns = groupByStatus([
      makeTask({ id: 'a', status: 'done' }),
      makeTask({ id: 'b', status: 'todo' }),
    ]);

    expect(columns.map((column) => column.status)).toEqual(['todo', 'in_progress', 'done']);
    expect(columns.map((column) => column.tasks.map((task) => task.id))).toEqual([
      ['b'],
      [],
      ['a'],
    ]);
  });

  it('orders each column by its saved order, and unmoved tasks by creation time', () => {
    const columns = groupByStatus([
      makeTask({ id: 'newer', createdAt: '2026-11-10T10:00:00' }),
      makeTask({ id: 'older', createdAt: '2026-11-01T10:00:00' }),
      makeTask({ id: 'moved-to-top', createdAt: '2026-11-20T10:00:00', order: 0 }),
    ]);

    expect(columns[0].tasks.map((task) => task.id)).toEqual(['moved-to-top', 'older', 'newer']);
  });
});

describe('getOrderAt', () => {
  const column = [makeTask({ id: 'a', order: 10 }), makeTask({ id: 'b', order: 20 })];

  it('places a task between the cards above and below it', () => {
    expect(getOrderAt(column, 1)).toBe(15);
  });

  it('places a task above the first card or below the last one', () => {
    expect(getOrderAt(column, 0)).toBe(9);
    expect(getOrderAt(column, 2)).toBe(21);
  });

  it('starts an empty column at 0', () => {
    expect(getOrderAt([], 0)).toBe(0);
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
