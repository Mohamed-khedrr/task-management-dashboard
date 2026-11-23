import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PopoverModule } from 'primeng/popover';
import { LanguageService } from '../../core/i18n/language.service';
import { ACTIVITY_ICONS } from '../../core/models/activity.model';
import { TaskService } from '../../core/services/task.service';
import { getRecentActivity } from '../../core/utils/activity.utils';
import { formatTimeAgo } from '../../core/utils/relative-time';
import { TruncateDirective } from '../../shared/directives/truncate.directive';

const LATEST_COUNT = 5;

@Component({
  selector: 'app-notifications',
  imports: [RouterLink, TranslocoPipe, PopoverModule, TruncateDirective],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly language = inject(LanguageService);
  private readonly taskResource = inject(TaskService).tasks;

  protected readonly icons = ACTIVITY_ICONS;
  protected readonly isOpen = signal(false);

  protected readonly items = computed(() => {
    const tasks = this.taskResource.hasValue() ? this.taskResource.value() : [];
    const lang = this.language.activeLang();
    const now = new Date();

    return getRecentActivity(tasks)
      .slice(0, LATEST_COUNT)
      .map((activity) => ({ ...activity, timeAgo: formatTimeAgo(activity.at, now, lang) }));
  });

  protected onClosed(bell: HTMLButtonElement) {
    this.isOpen.set(false);

    // PrimeNG doesn't move focus when the panel closes (on Escape, for example), so focus that
    // was inside the removed panel would be lost
    if (document.activeElement === document.body) {
      bell.focus();
    }
  }
}
