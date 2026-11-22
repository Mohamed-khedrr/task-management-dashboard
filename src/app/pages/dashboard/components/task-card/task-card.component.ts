import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { formatDayCount, formatRelativeDays } from '../../../../core/utils/relative-time';
import { getTaskTiming, isTaskOverdue } from '../../../../core/utils/task.utils';
import { Task } from '../../../../core/models/task.model';
import { LanguageService } from '../../../../core/i18n/language.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TruncateDirective } from '../../../../shared/directives/truncate.directive';

@Component({
  selector: 'app-task-card',
  imports: [TranslocoPipe, TruncateDirective, Menu, ProgressSpinner],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'task().status',
    '[class.overdue]': 'overdue()',
    '[class.deleting]': 'deleting()',
  },
})
export class TaskCardComponent {
  private readonly language = inject(LanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly today = new Date();

  readonly task = input.required<Task>();
  readonly deleting = input(false);

  readonly editRequested = output<void>();
  readonly deleteRequested = output<void>();

  protected readonly overdue = computed(() => isTaskOverdue(this.task(), this.today));
  protected readonly menuItems = computed<MenuItem[]>(() => {
    const lang = this.language.activeLang();
    return [
      {
        label: this.transloco.translate('taskActions.edit', {}, lang),
        command: () => this.editRequested.emit(),
      },
      {
        label: this.transloco.translate('taskActions.delete', {}, lang),
        command: () => this.deleteRequested.emit(),
      },
    ];
  });

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
