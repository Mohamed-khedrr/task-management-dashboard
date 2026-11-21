import {
  Task,
  TASK_PRIORITIES,
  TaskStats,
  TaskTiming,
  TaskColumn,
  TASK_STATUSES,
  TaskStatus,
} from '../models/task.model';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// toISOString() would use UTC and shift dates around midnight
export function toIsoDate(date: Date) {
  return date.toLocaleDateString('en-CA');
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_IN_MS);
}

// The isOverdue field in the API data is unreliable, so it's derived instead
function isOverdueOn(task: Task, todayIso: string) {
  return task.status !== 'done' && task.dueDate < todayIso;
}

export function isTaskOverdue(task: Task, today: Date) {
  return isOverdueOn(task, toIsoDate(today));
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

    if (isOverdueOn(task, todayIso)) {
      stats.overdue++;
      if (daysBetween(task.dueDate, todayIso) === 1) {
        stats.overdueSinceToday++;
      }
    }
  }

  return stats;
}

export function getTaskTiming(task: Task, today: Date): TaskTiming {
  const todayIso = toIsoDate(today);
  if (task.status === 'done') {
    const completedOn = task.completedAt ? toIsoDate(new Date(task.completedAt)) : todayIso;
    return { kind: 'completed', days: daysBetween(completedOn, todayIso) };
  }

  const daysLeft = daysBetween(todayIso, task.dueDate);
  if (daysLeft < 0) {
    return { kind: 'overdue', days: -daysLeft };
  }
  return { kind: 'due', days: daysLeft };
}

export function sortTasks(tasks: Task[], today: Date) {
  const todayIso = toIsoDate(today);

  return [...tasks].sort((a, b) => {
    const aOverdue = isOverdueOn(a, todayIso);
    const bOverdue = isOverdueOn(b, todayIso);
    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1;
    }

    if (a.priority !== b.priority) {
      return TASK_PRIORITIES.indexOf(a.priority) - TASK_PRIORITIES.indexOf(b.priority);
    }

    return a.dueDate.localeCompare(b.dueDate);
  });
}

export function groupByStatus(tasks: Task[], today: Date): TaskColumn[] {
  const tasksByStatus: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };

  for (const task of tasks) {
    tasksByStatus[task.status].push(task);
  }

  return TASK_STATUSES.map((status) => ({
    status,
    tasks: sortTasks(tasksByStatus[status], today),
  }));
}
