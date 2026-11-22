import {
  Task,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskColumn,
  TaskFilters,
  TaskStatus,
  TaskTiming,
} from '../models/task.model';
import { daysBetween, toIsoDate } from './date.utils';

// The isOverdue field in the API data is unreliable, so it's derived instead
export function isOverdueOn(task: Task, todayIso: string) {
  return task.status !== 'done' && task.dueDate < todayIso;
}

export function isTaskOverdue(task: Task, today: Date) {
  return isOverdueOn(task, toIsoDate(today));
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

export function filterTasks(tasks: Task[], filters: TaskFilters) {
  const search = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    if (filters.assigneeId && task.assignee.id !== filters.assigneeId) {
      return false;
    }
    if (!search) {
      return true;
    }
    return (
      task.title.toLowerCase().includes(search) || task.description.toLowerCase().includes(search)
    );
  });
}
