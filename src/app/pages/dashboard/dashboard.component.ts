import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { TaskService } from '../../core/services/task.service';
import { computeTaskStats, filterTasks, groupByStatus } from '../../core/utils/task.utils';
import { TaskFiltersService } from '../../core/services/task-filters.service';
import { UserService } from '../../core/services/user.service';
import { TaskToolbarComponent } from './components/task-toolbar/task-toolbar.component';
import { StatCard } from '../../core/models/stat-card.model';
import { TaskMove } from '../../core/models/task.model';
import { TaskBoardComponent } from './components/task-board/task-board.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    TranslocoPipe,
    ButtonModule,
    MessageModule,
    SkeletonModule,
    StatCardComponent,
    TaskBoardComponent,
    TaskToolbarComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly taskResource = this.taskService.tasks;
  private readonly today = new Date();

  protected readonly filters = inject(TaskFiltersService);
  protected readonly users = inject(UserService).users;

  protected readonly isLoading = computed(() => this.taskResource.status() === 'loading');
  protected readonly error = this.taskResource.error;

  private readonly tasks = computed(() =>
    this.taskResource.hasValue() ? this.taskResource.value() : [],
  );

  private readonly visibleTasks = computed(() =>
    filterTasks(this.tasks(), this.filters.criteria()),
  );

  // Kept separate from the status pick so switching tabs doesn't re-sort every column
  private readonly allColumns = computed(() => groupByStatus(this.visibleTasks(), this.today));

  protected readonly columns = computed(() => {
    const status = this.filters.status();
    if (status === 'all') {
      return this.allColumns();
    }
    return this.allColumns().filter((column) => column.status === status);
  });

  protected readonly hasNoMatches = computed(
    () => this.filters.hasActiveFilters() && !this.columns().some((column) => column.tasks.length),
  );

  protected readonly statCards = computed<StatCard[]>(() => {
    const stats = computeTaskStats(this.tasks(), this.today);

    return [
      {
        icon: '📊',
        labelKey: 'dashboard.stats.total',
        value: stats.total,
        changeKey: 'dashboard.stats.createdThisWeek',
        changeCount: stats.createdThisWeek,
        tone: 'positive',
      },
      {
        icon: '✅',
        labelKey: 'dashboard.stats.completed',
        value: stats.completed,
        changeKey: 'dashboard.stats.completedToday',
        changeCount: stats.completedToday,
        tone: 'positive',
      },
      {
        icon: '🔄',
        labelKey: 'dashboard.stats.inProgress',
        value: stats.inProgress,
        changeKey: 'dashboard.stats.highPriority',
        changeCount: stats.inProgressHighPriority,
        tone: 'neutral',
      },
      {
        icon: '⚠️',
        labelKey: 'dashboard.stats.overdue',
        value: stats.overdue,
        changeKey: 'dashboard.stats.overdueSinceToday',
        changeCount: stats.overdueSinceToday,
        tone: 'negative',
      },
    ];
  });

  ngOnInit(): void {
    this.taskResource.reload();
  }

  protected retry() {
    this.taskResource.reload();
  }

  protected moveTask(move: TaskMove) {
    this.taskService.updateStatus(move.taskId, move.status);
  }
}
