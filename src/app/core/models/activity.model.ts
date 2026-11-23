import { Assignee } from './task.model';

export type ActivityKind = 'created' | 'updated' | 'completed';

export interface Activity {
  id: string;
  kind: ActivityKind;
  taskTitle: string;
  assignee: Assignee;
  at: string;
}
