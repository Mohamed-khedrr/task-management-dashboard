import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  OnInit,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { SearchService } from '../../core/services/search.service';
import { TaskService } from '../../core/services/task.service';
import { getRecentActivity } from '../../core/utils/activity.utils';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';

const PAGE_SIZE = 30;

@Component({
  selector: 'app-activity',
  imports: [TranslocoPipe, ButtonModule, MessageModule, SkeletonModule, ActivityFeedComponent],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityComponent implements OnInit {
  private readonly taskResource = inject(TaskService).tasks;
  private readonly search = inject(SearchService);

  protected readonly isLoading = computed(() => this.taskResource.isLoading());
  protected readonly error = this.taskResource.error;

  private readonly tasks = computed(() =>
    this.taskResource.hasValue() ? this.taskResource.value() : [],
  );

  protected readonly hasNoTasks = computed(() => this.tasks().length === 0);

  private readonly allActivities = computed(() => {
    const query = this.search.query().toLowerCase();
    const matching = this.tasks().filter(
      (task) =>
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.assignee.name.toLowerCase().includes(query),
    );
    return getRecentActivity(matching);
  });

  // Starts again at one page whenever the search changes
  private readonly visibleCount = linkedSignal({
    source: this.search.query,
    computation: () => PAGE_SIZE,
  });

  protected readonly activities = computed(() =>
    this.allActivities().slice(0, this.visibleCount()),
  );

  protected readonly nextPageSize = computed(() =>
    Math.min(PAGE_SIZE, this.allActivities().length - this.visibleCount()),
  );

  ngOnInit(): void {
    this.taskResource.reload();
  }

  protected showMore() {
    this.visibleCount.update((count) => count + PAGE_SIZE);
  }

  protected retry() {
    this.taskResource.reload();
  }
}
