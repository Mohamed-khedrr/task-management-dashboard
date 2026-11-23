import { Activity } from '../models/activity.model';
import { Task } from '../models/task.model';

/**
 * Builds the activity feed from the task dates, since the API has no activity log:
 * `createdAt` gives "created", `completedAt` gives "completed", and an `updatedAt`
 * that differs from both gives "updated". Deleted tasks leave no trace.
 * Returns the newest first.
 */
export function getRecentActivity(tasks: Task[]): Activity[] {
  const activities: Activity[] = [];

  for (const task of tasks) {
    const base = { taskTitle: task.title, assignee: task.assignee };

    activities.push({ ...base, id: `${task.id}-created`, kind: 'created', at: task.createdAt });

    if (task.completedAt) {
      activities.push({
        ...base,
        id: `${task.id}-completed`,
        kind: 'completed',
        at: task.completedAt,
      });
    }

    if (task.updatedAt !== task.createdAt && task.updatedAt !== task.completedAt) {
      activities.push({ ...base, id: `${task.id}-updated`, kind: 'updated', at: task.updatedAt });
    }
  }

  return activities
    .filter((activity) => !Number.isNaN(Date.parse(activity.at)))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}
