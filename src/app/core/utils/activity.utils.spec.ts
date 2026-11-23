import { Task } from '../models/task.model';
import { getRecentActivity } from './activity.utils';

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

const kinds = (tasks: Task[]) =>
  getRecentActivity(tasks).map((activity) => `${activity.taskTitle}:${activity.kind}`);

describe('getRecentActivity', () => {
  it('shows only "created" for a task that was never changed', () => {
    expect(kinds([makeTask()])).toEqual(['Write report:created']);
  });

  it('adds "updated" when the task changed after it was created', () => {
    const task = makeTask({ updatedAt: '2026-11-03T10:00:00' });

    expect(kinds([task])).toEqual(['Write report:updated', 'Write report:created']);
  });

  it('shows the completion once, not also as an update', () => {
    const task = makeTask({
      status: 'done',
      completedAt: '2026-11-05T10:00:00',
      updatedAt: '2026-11-05T10:00:00',
    });

    expect(kinds([task])).toEqual(['Write report:completed', 'Write report:created']);
  });

  it('lists changes from all tasks newest first', () => {
    const tasks = [
      makeTask({
        id: 'a',
        title: 'A',
        createdAt: '2026-11-02T10:00:00',
        updatedAt: '2026-11-02T10:00:00',
      }),
      makeTask({
        id: 'b',
        title: 'B',
        createdAt: '2026-11-04T10:00:00',
        updatedAt: '2026-11-04T10:00:00',
      }),
      makeTask({
        id: 'c',
        title: 'C',
        createdAt: '2026-11-03T10:00:00',
        updatedAt: '2026-11-03T10:00:00',
      }),
    ];

    expect(kinds(tasks)).toEqual(['B:created', 'C:created', 'A:created']);
  });

  it('skips entries with an invalid date', () => {
    const task = makeTask({ createdAt: 'not a date', updatedAt: '2026-11-03T10:00:00' });

    expect(kinds([task])).toEqual(['Write report:updated']);
  });

  it('gives every entry a unique id', () => {
    const task = makeTask({
      status: 'done',
      updatedAt: '2026-11-03T10:00:00',
      completedAt: '2026-11-05T10:00:00',
    });
    const ids = getRecentActivity([task]).map((activity) => activity.id);

    expect(new Set(ids).size).toBe(3);
  });
});
