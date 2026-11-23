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
import { normalizeSearchText } from './text.utils';

/**
 * A task is overdue when it isn't done and its due date is before today.
 * The `isOverdue` field in the API data is unreliable, so it's derived instead.
 * @param todayIso today as `YYYY-MM-DD`, so it compares directly with `dueDate`
 */
export function isOverdueOn(task: Task, todayIso: string) {
  return task.status !== 'done' && task.dueDate < todayIso;
}

export function isTaskOverdue(task: Task, today: Date) {
  return isOverdueOn(task, toIsoDate(today));
}

/**
 * What the card shows under the title: days since completion for done tasks,
 * days past due for overdue tasks, otherwise days left until the due date.
 */
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

/**
 * Orders a column so the most urgent work is on top: overdue tasks first,
 * then by priority (high to low), then by the earliest due date.
 * Returns a new array.
 */
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

/** Splits tasks into the three board columns, always in board order and including empty ones. */
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

/**
 * Applies the toolbar filters. The search matches the title or description,
 * ignoring case, spacing, accents and Arabic letter forms (see {@link normalizeSearchText}). Status isn't filtered here: the board
 * hides whole columns instead.
 */
export function filterTasks(tasks: Task[], filters: TaskFilters) {
  const search = normalizeSearchText(filters.search);

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
      normalizeSearchText(task.title).includes(search) ||
      normalizeSearchText(task.description).includes(search)
    );
  });
}
