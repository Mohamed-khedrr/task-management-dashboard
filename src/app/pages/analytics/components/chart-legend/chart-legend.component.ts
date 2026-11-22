import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ChartItem } from '../../../../core/models/chart.model';

@Component({
  selector: 'app-chart-legend',
  templateUrl: './chart-legend.component.html',
  styleUrl: './chart-legend.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartLegendComponent {
  readonly items = input.required<ChartItem[]>();
}
