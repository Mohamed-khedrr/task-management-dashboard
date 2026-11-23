import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TeamMember } from '../../core/models/team.model';
import { SearchService } from '../../core/services/search.service';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import {
  countByAssigneeAndStatus,
  countOverdueByAssignee,
} from '../../core/utils/task-stats.utils';
import { MemberCardComponent } from './components/member-card/member-card.component';

@Component({
  selector: 'app-team',
  imports: [TranslocoPipe, ButtonModule, MessageModule, SkeletonModule, MemberCardComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent implements OnInit {
  private readonly userResource = inject(UserService).users;
  private readonly taskResource = inject(TaskService).tasks;
  private readonly search = inject(SearchService);

  private readonly today = new Date();

  protected readonly skeletons = [0, 1, 2, 3, 4, 5];

  protected readonly isLoading = computed(
    () => this.userResource.isLoading() || this.taskResource.isLoading(),
  );
  protected readonly error = computed(() => this.userResource.error() ?? this.taskResource.error());

  private readonly users = computed(() =>
    this.userResource.hasValue() ? this.userResource.value() : [],
  );

  private readonly tasks = computed(() =>
    this.taskResource.hasValue() ? this.taskResource.value() : [],
  );

  protected readonly members = computed<TeamMember[]>(() => {
    const counts = countByAssigneeAndStatus(this.tasks());
    const overdue = countOverdueByAssignee(this.tasks(), this.today);

    return this.users().map((user) => ({
      user,
      counts: counts.get(user.id) ?? { todo: 0, in_progress: 0, done: 0 },
      overdue: overdue.get(user.id) ?? 0,
    }));
  });

  protected readonly visibleMembers = computed(() => {
    const query = this.search.query().toLowerCase();
    if (!query) {
      return this.members();
    }
    return this.members().filter(
      (member) =>
        member.user.name.toLowerCase().includes(query) ||
        member.user.email.toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.taskResource.reload();
  }

  protected retry() {
    this.userResource.reload();
    this.taskResource.reload();
  }
}
