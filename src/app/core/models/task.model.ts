export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['high', 'medium', 'low'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PRIORITY_ICONS: Record<TaskPriority, string> = {
  high: '🔴',
  medium: '🟠',
  low: '🟢',
};

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue?: boolean;
  completedAt?: string;
  assignee: Assignee;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// What the form edits; the service fills in the id and the dates
export type TaskDraft = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'assignee' | 'tags'
>;

export interface TaskStats {
  total: number;
  createdThisWeek: number;
  completed: number;
  completedToday: number;
  inProgress: number;
  inProgressHighPriority: number;
  overdue: number;
  overdueSinceToday: number;
}

export interface TaskColumn {
  status: TaskStatus;
  tasks: Task[];
}

export type TaskTimingKind = 'overdue' | 'due' | 'completed';

export interface TaskTiming {
  kind: TaskTimingKind;
  days: number;
}

export interface TaskMove {
  taskId: string;
  status: TaskStatus;
}

export type StatusFilter = TaskStatus | 'all';

export interface TaskFilters {
  search: string;
  priority: TaskPriority | null;
  assigneeId: string | null;
}
