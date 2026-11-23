import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { MemberDraft, TeamMember } from '../../core/models/team.model';
import { SearchService } from '../../core/services/search.service';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import {
  countByAssigneeAndStatus,
  countOverdueByAssignee,
} from '../../core/utils/task-stats.utils';
import { MemberCardComponent } from './components/member-card/member-card.component';
import { MemberFormComponent } from './components/member-form/member-form.component';

@Component({
  selector: 'app-team',
  imports: [
    TranslocoPipe,
    ButtonModule,
    Dialog,
    MessageModule,
    SkeletonModule,
    MemberCardComponent,
    MemberFormComponent,
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly userResource = this.userService.users;
  private readonly taskResource = inject(TaskService).tasks;
  private readonly search = inject(SearchService);
  private readonly messages = inject(MessageService);
  private readonly transloco = inject(TranslocoService);

  private readonly today = new Date();

  protected readonly skeletons = [0, 1, 2, 3, 4, 5];

  protected readonly isAddOpen = signal(false);
  protected readonly isSaving = signal(false);

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

  protected readonly takenEmails = computed(() => this.users().map((user) => user.email));

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

  protected closeAdd() {
    if (!this.isSaving()) {
      this.isAddOpen.set(false);
    }
  }

  protected addMember(draft: MemberDraft) {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.userService.createUser(draft).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isAddOpen.set(false);
        this.messages.add({
          severity: 'success',
          summary: this.transloco.translate('team.memberAdded', { name: draft.name }),
        });
      },
      // The error interceptor shows the toast and the dialog stays open to try again
      error: () => this.isSaving.set(false),
    });
  }

  protected retry() {
    this.userResource.reload();
    this.taskResource.reload();
  }
}
