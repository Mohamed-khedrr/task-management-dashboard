import {
  Task,
  TASK_STATUSES,
  TaskColumn,
  TaskFilters,
  TaskStatus,
  TaskTiming,
} from '../models/task.model';
import { daysBetween, toIsoDate } from './date.utils';

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
 * A task's position in its column. Tasks that were never moved have no `order`,
 * so they fall back to their creation time: oldest first, and new tasks at the bottom.
 */
export function getTaskOrder(task: Task) {
  return task.order ?? Date.parse(task.createdAt);
}

/**
 * The `order` for a task dropped at `index`, picked so it sorts between the cards
 * above and below it. Only the dropped task changes, so only it is saved.
 *
 * | Dropped                 | New order |
 * | ----------------------- | --------- |
 * | between 10 and 20       | 15        |
 * | at the top, above 10    | 9         |
 * | at the bottom, below 20 | 21        |
 * | in an empty column      | 0         |
 *
 * @param columnTasks the column's tasks, without the task being moved
 */
export function getOrderAt(columnTasks: Task[], index: number) {
  const above = columnTasks[index - 1];
  const below = columnTasks[index];

  if (!above && !below) {
    return 0;
  }
  if (!above) {
    return getTaskOrder(below) - 1;
  }
  if (!below) {
    return getTaskOrder(above) + 1;
  }
  return (getTaskOrder(above) + getTaskOrder(below)) / 2;
}

/** Splits tasks into the three board columns, always in board order and including empty ones. */
export function groupByStatus(tasks: Task[]): TaskColumn[] {
  const tasksByStatus: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };

  for (const task of tasks) {
    tasksByStatus[task.status].push(task);
  }

  return TASK_STATUSES.map((status) => ({
    status,
    tasks: tasksByStatus[status].sort((a, b) => getTaskOrder(a) - getTaskOrder(b)),
  }));
}

/**
 * Applies the toolbar filters. The search matches the title or description,
 * ignoring case and surrounding spaces. Status isn't filtered here: the board
 * hides whole columns instead.
 */
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
