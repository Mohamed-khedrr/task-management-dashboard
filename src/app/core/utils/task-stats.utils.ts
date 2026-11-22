import { Task, TaskStats, TaskStatus } from '../models/task.model';
import { daysBetween, toIsoDate } from './date.utils';
import { isOverdueOn } from './task.utils';

/**
 * Counts the four stat cards and the change line under each one in a single pass.
 * The API statistics are fixed numbers, so everything is calculated from the tasks
 * to stay correct after the user creates, moves or deletes one.
 */
export function computeTaskStats(tasks: Task[], today: Date) {
  const todayIso = toIsoDate(today);
  const stats: TaskStats = {
    total: tasks.length,
    createdThisWeek: 0,
    completed: 0,
    completedToday: 0,
    inProgress: 0,
    inProgressHighPriority: 0,
    overdue: 0,
    overdueSinceToday: 0,
  };

  for (const task of tasks) {
    if (daysBetween(toIsoDate(new Date(task.createdAt)), todayIso) < 7) {
      stats.createdThisWeek++;
    }

    if (task.status === 'done') {
      stats.completed++;
      if (task.completedAt && toIsoDate(new Date(task.completedAt)) === todayIso) {
        stats.completedToday++;
      }
      continue;
    }

    if (task.status === 'in_progress') {
      stats.inProgress++;
      if (task.priority === 'high') {
        stats.inProgressHighPriority++;
      }
    }

    if (isOverdueOn(task, todayIso)) {
      stats.overdue++;
      if (daysBetween(task.dueDate, todayIso) === 1) {
        stats.overdueSinceToday++;
      }
    }
  }

  return stats;
}

/** Counts tasks per status or priority. Values with no tasks are missing from the map. */
export function countByField<K extends 'status' | 'priority'>(tasks: Task[], field: K) {
  const counts = new Map<Task[K], number>();
  for (const task of tasks) {
    counts.set(task[field], (counts.get(task[field]) ?? 0) + 1);
  }
  return counts;
}

/** Maps each assignee id to how many of their tasks are in each status. */
export function countByAssigneeAndStatus(tasks: Task[]) {
  const counts = new Map<string, Record<TaskStatus, number>>();
  for (const task of tasks) {
    let row = counts.get(task.assignee.id);
    if (!row) {
      row = { todo: 0, in_progress: 0, done: 0 };
      counts.set(task.assignee.id, row);
    }
    row[task.status]++;
  }
  return counts;
}

/** Maps each assignee id to how many of their open tasks are overdue. */
export function countOverdueByAssignee(tasks: Task[], today: Date) {
  const todayIso = toIsoDate(today);
  const counts = new Map<string, number>();
  for (const task of tasks) {
    if (isOverdueOn(task, todayIso)) {
      counts.set(task.assignee.id, (counts.get(task.assignee.id) ?? 0) + 1);
    }
  }
  return counts;
}
