import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { formatDayCount, formatRelativeDays } from '../../../../core/utils/relative-time';
import { getTaskTiming, isTaskOverdue } from '../../../../core/utils/task.utils';
import { Task } from '../../../../core/models/task.model';
import { LanguageService } from '../../../../core/i18n/language.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { TruncateDirective } from '../../../../shared/directives/truncate.directive';

@Component({
  selector: 'app-task-card',
  imports: [TranslocoPipe, TruncateDirective],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'task().status',
    '[class.overdue]': 'overdue()',
  },
})
export class TaskCardComponent {
  private readonly language = inject(LanguageService);
  private readonly today = new Date();

  readonly task = input.required<Task>();

  readonly opened = output<void>();

  protected readonly overdue = computed(() => isTaskOverdue(this.task(), this.today));
  protected readonly assigneeFirstName = computed(() => this.task().assignee.name.split(' ')[0]);

  protected readonly timing = computed(() => {
    const { kind, days } = getTaskTiming(this.task(), this.today);
    const lang = this.language.activeLang();

    switch (kind) {
      case 'overdue':
        return {
          icon: '⚠',
          key: 'task.timing.overdue',
          params: { duration: formatDayCount(days, lang) },
        };
      case 'completed':
        return {
          icon: '✅',
          key: 'task.timing.completed',
          params: { when: formatRelativeDays(-days, lang) },
        };
      case 'due':
        return {
          icon: '📅',
          key: 'task.timing.due',
          params: { when: formatRelativeDays(days, lang) },
        };
    }
  });
}
