import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { LanguageService } from '../../core/i18n/language.service';
import { ChartItem, ChartSeries } from '../../core/models/chart.model';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { countByAssigneeAndStatus, countByField } from '../../core/utils/task-stats.utils';
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
export class AnalyticsComponent implements OnInit {
  private readonly taskResource = inject(TaskService).tasks;
  private readonly users = inject(UserService).users;
  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(LanguageService);

  private readonly statusColors = {
    todo: cssVar('--color-primary'),
    in_progress: cssVar('--color-in-progress'),
    done: cssVar('--color-success'),
  };

  private readonly priorityColors = {
    high: cssVar('--color-danger'),
    medium: cssVar('--color-warning'),
    low: cssVar('--color-success'),
  };

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

  // Same as the dashboard: show fresh data when the page opens
  ngOnInit() {
    this.taskResource.reload();
  }

  protected retry() {
    this.taskResource.reload();
  }

  // Reading activeLang makes the labels update when the language changes
  private translate(key: string) {
    return this.transloco.translate(key, {}, this.language.activeLang());
  }
}
