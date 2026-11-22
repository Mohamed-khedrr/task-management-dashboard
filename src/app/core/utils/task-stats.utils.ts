import { Task, TaskStats } from '../models/task.model';
import { daysBetween, toIsoDate } from './date.utils';
import { isOverdueOn } from './task.utils';

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
