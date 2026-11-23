import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '../../../../core/i18n/language.service';
import { Activity, ACTIVITY_ICONS } from '../../../../core/models/activity.model';
import { formatTimeAgo } from '../../../../core/utils/relative-time';
import { TruncateDirective } from '../../../../shared/directives/truncate.directive';

@Component({
  selector: 'app-activity-feed',
  imports: [TranslocoPipe, TruncateDirective],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeedComponent {
  private readonly language = inject(LanguageService);

  readonly activities = input.required<Activity[]>();

  protected readonly icons = ACTIVITY_ICONS;

  protected readonly items = computed(() => {
    const lang = this.language.activeLang();
    const now = new Date();

    return this.activities().map((activity) => ({
      ...activity,
      timeAgo: formatTimeAgo(activity.at, now, lang),
    }));
  });
}
