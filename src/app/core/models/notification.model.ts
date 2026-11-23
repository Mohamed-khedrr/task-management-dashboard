export type NotificationKind = 'assigned' | 'completed' | 'dueSoon' | 'overdue';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  taskTitle: string;
  /** Who did it; only for kinds that come from a person (assigned, completed) */
  personName?: string;
  at: string;
  read: boolean;
}
