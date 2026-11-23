import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Chart } from 'chart.js';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { LanguageService } from '../../core/i18n/language.service';
import { ChartItem, ChartSeries } from '../../core/models/chart.model';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import {
  computeTaskStats,
  countByAssigneeAndStatus,
  countByField,
  countOverdueByAssignee,
} from '../../core/utils/task-stats.utils';
import { ChartCardComponent } from './components/chart-card/chart-card.component';
import { StackedBarCardComponent } from './components/stacked-bar-card/stacked-bar-card.component';

// Chart.js draws on a canvas and can't read CSS variables, so the token values are read once
function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

@Component({
  selector: 'app-analytics',
  imports: [
    TranslocoPipe,
    ButtonModule,
    MessageModule,
    SkeletonModule,
    ChartCardComponent,
    StackedBarCardComponent,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent {
  private readonly taskResource = inject(TaskService).createTasksResource();
  private readonly users = inject(UserService).users;
  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(LanguageService);

  private readonly today = new Date();

  private readonly statusColors = {
    todo: cssVar('--chart-blue'),
    in_progress: cssVar('--chart-orange'),
    done: cssVar('--chart-green'),
  };

  private readonly priorityColors = {
    high: cssVar('--chart-red'),
    medium: cssVar('--chart-orange'),
    low: cssVar('--chart-gray'),
  };

  private readonly overdueColor = cssVar('--chart-red');
  private readonly onTrackColor = cssVar('--chart-green');

  constructor() {
    // Axis text, grid lines and tooltips in the app's font and colors
    Chart.defaults.font.family = cssVar('--font-family');
    Chart.defaults.color = cssVar('--color-text-muted');
    Chart.defaults.borderColor = cssVar('--color-border');
  }

  protected readonly isLoading = computed(() => this.taskResource.status() === 'loading');
  protected readonly error = this.taskResource.error;
  protected readonly isRtl = computed(() => this.language.activeLang() === 'ar');

  private readonly tasks = computed(() =>
    this.taskResource.hasValue() ? this.taskResource.value() : [],
  );

  protected readonly hasNoTasks = computed(() => this.tasks().length === 0);

  protected readonly statusItems = computed<ChartItem[]>(() => {
    const counts = countByField(this.tasks(), 'status');
    return TASK_STATUSES.map((status) => ({
      label: this.translate(`task.status.${status}`),
      count: counts.get(status) ?? 0,
      color: this.statusColors[status],
    }));
  });

  protected readonly priorityItems = computed<ChartItem[]>(() => {
    const counts = countByField(this.tasks(), 'priority');
    return TASK_PRIORITIES.map((priority) => ({
      label: this.translate(`task.priority.${priority}`),
      count: counts.get(priority) ?? 0,
      color: this.priorityColors[priority],
    }));
  });

  // Open tasks only: done tasks can't be late
  protected readonly timelinessItems = computed<ChartItem[]>(() => {
    const stats = computeTaskStats(this.tasks(), this.today);
    const open = stats.total - stats.completed;
    return [
      {
        label: this.translate('analytics.onTrack'),
        count: open - stats.overdue,
        color: this.onTrackColor,
      },
      {
        label: this.translate('analytics.overdue'),
        count: stats.overdue,
        color: this.overdueColor,
      },
    ];
  });

  protected readonly personLabels = computed(() => this.users.value().map((user) => user.name));

  // One layer per status, with one value per person
  protected readonly personSeries = computed<ChartSeries[]>(() => {
    const counts = countByAssigneeAndStatus(this.tasks());
    return TASK_STATUSES.map((status) => ({
      label: this.translate(`task.status.${status}`),
      values: this.users.value().map((user) => counts.get(user.id)?.[status] ?? 0),
      color: this.statusColors[status],
    }));
  });

  // Most overdue first, so the people who need help are easy to spot
  private readonly overdueByPerson = computed(() => {
    const counts = countOverdueByAssignee(this.tasks(), this.today);
    return this.users
      .value()
      .map((user) => ({ name: user.name, count: counts.get(user.id) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  });

  protected readonly overdueLabels = computed(() => this.overdueByPerson().map((row) => row.name));

  protected readonly overdueSeries = computed<ChartSeries[]>(() => [
    {
      label: this.translate('analytics.overdue'),
      values: this.overdueByPerson().map((row) => row.count),
      color: this.overdueColor,
    },
  ]);

  protected retry() {
    this.taskResource.reload();
  }

  // Reading activeLang makes the labels update when the language changes
  private translate(key: string) {
    return this.transloco.translate(key, {}, this.language.activeLang());
  }
}
