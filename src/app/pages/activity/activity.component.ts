import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TaskService } from '../../core/services/task.service';
import { getRecentActivity } from '../../core/utils/activity.utils';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';

const ACTIVITY_LIMIT = 30;

@Component({
  selector: 'app-activity',
  imports: [TranslocoPipe, ButtonModule, MessageModule, SkeletonModule, ActivityFeedComponent],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityComponent implements OnInit {
  private readonly taskResource = inject(TaskService).tasks;

  protected readonly isLoading = computed(() => this.taskResource.isLoading());
  protected readonly error = this.taskResource.error;

  protected readonly activities = computed(() => {
    const tasks = this.taskResource.hasValue() ? this.taskResource.value() : [];
    return getRecentActivity(tasks, ACTIVITY_LIMIT);
  });

  ngOnInit(): void {
    this.taskResource.reload();
  }

  protected retry() {
    this.taskResource.reload();
  }
}
