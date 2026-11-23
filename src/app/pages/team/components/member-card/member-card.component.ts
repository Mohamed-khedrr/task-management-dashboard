import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { TASK_STATUSES } from '../../../../core/models/task.model';
import { TeamMember } from '../../../../core/models/team.model';

@Component({
  selector: 'app-member-card',
  imports: [TranslocoPipe],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCardComponent {
  readonly member = input.required<TeamMember>();

  protected readonly statuses = TASK_STATUSES;
}
