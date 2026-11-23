import { Assignee, TaskStatus } from './task.model';

// What the Add member form fills in; the service adds the id and the avatar initials
export type MemberDraft = Pick<Assignee, 'name' | 'email'>;

export interface TeamMember {
  user: Assignee;
  counts: Record<TaskStatus, number>;
  overdue: number;
}
