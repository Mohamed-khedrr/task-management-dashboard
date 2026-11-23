import { Assignee, TaskStatus } from './task.model';

export interface TeamMember {
  user: Assignee;
  counts: Record<TaskStatus, number>;
  overdue: number;
}
