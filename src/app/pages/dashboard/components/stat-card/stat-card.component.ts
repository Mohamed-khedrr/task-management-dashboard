import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatCard } from '../../../../core/models/stat-card.model';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-stat-card',
  imports: [TranslocoPipe],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly card = input.required<StatCard>();
}
