import { Task, TaskStats } from '../models/task.model';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// toISOString() would use UTC and shift dates around midnight
export function toIsoDate(date: Date) {
  return date.toLocaleDateString('en-CA');
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_IN_MS);
}

// The isOverdue field in the API data is unreliable, so it's derived instead
export function isTaskOverdue(task: Task, today: Date) {
  return task.status !== 'done' && task.dueDate < toIsoDate(today);
}

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

    if (isTaskOverdue(task, today)) {
      stats.overdue++;
      if (daysBetween(task.dueDate, todayIso) === 1) {
        stats.overdueSinceToday++;
      }
    }
  }

  return stats;
}
