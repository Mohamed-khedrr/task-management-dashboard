import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { PopoverModule } from 'primeng/popover';
import { LanguageService } from '../../core/i18n/language.service';
import { AppNotification, NotificationKind } from '../../core/models/notification.model';
import { formatTimeAgo } from '../../core/utils/relative-time';

const NOTIFICATION_ICONS: Record<NotificationKind, string> = {
  assigned: '📌',
  completed: '✅',
  dueSoon: '⏰',
  overdue: '⚠️',
};

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

// Static sample data: the mock API has no notifications endpoint
const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notification-1',
    kind: 'assigned',
    personName: 'Sarah Smith',
    taskTitle: 'Update documentation',
    at: minutesAgo(5),
    read: false,
  },
  {
    id: 'notification-2',
    kind: 'completed',
    personName: 'John Doe',
    taskTitle: 'Design new homepage layout',
    at: minutesAgo(60),
    read: false,
  },
  {
    id: 'notification-3',
    kind: 'dueSoon',
    taskTitle: 'Prepare Q4 budget report',
    at: minutesAgo(3 * 60),
    read: true,
  },
  {
    id: 'notification-4',
    kind: 'overdue',
    taskTitle: 'Fix responsive design issues',
    at: minutesAgo(26 * 60),
    read: true,
  },
];

@Component({
  selector: 'app-notifications',
  imports: [TranslocoPipe, PopoverModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly language = inject(LanguageService);

  protected readonly icons = NOTIFICATION_ICONS;
  protected readonly notifications = signal(SAMPLE_NOTIFICATIONS);
  protected readonly isOpen = signal(false);

  protected readonly unreadCount = computed(
    () => this.notifications().filter((notification) => !notification.read).length,
  );

  protected readonly items = computed(() => {
    const lang = this.language.activeLang();
    const now = new Date();

    return this.notifications().map((notification) => ({
      ...notification,
      timeAgo: formatTimeAgo(notification.at, now, lang),
    }));
  });

  protected onClosed(bell: HTMLButtonElement) {
    this.isOpen.set(false);

    // PrimeNG doesn't move focus when the panel closes (on Escape, for example), so focus that
    // was inside the removed panel would be lost
    if (document.activeElement === document.body) {
      bell.focus();
    }
  }

  protected markAllAsRead() {
    this.notifications.update((list) =>
      list.map((notification) => ({ ...notification, read: true })),
    );
  }
}
