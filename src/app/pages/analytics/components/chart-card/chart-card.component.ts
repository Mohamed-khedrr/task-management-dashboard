import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { ChartItem } from '../../../../core/models/chart.model';
import { ChartLegendComponent } from '../chart-legend/chart-legend.component';

@Component({
  selector: 'app-chart-card',
  imports: [ChartModule, ChartLegendComponent],
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCardComponent {
  readonly title = input.required<string>();
  readonly kind = input.required<'doughnut' | 'bar'>();
  readonly items = input.required<ChartItem[]>();
  readonly rtl = input(false);

  protected readonly titleId = computed(() => `chart-${this.kind()}-title`);

  protected readonly data = computed<ChartData>(() => ({
    labels: this.items().map((item) => item.label),
    datasets: [
      {
        data: this.items().map((item) => item.count),
        backgroundColor: this.items().map((item) => item.color),
        borderWidth: 0,
      },
    ],
  }));

  protected readonly options = computed<ChartOptions>(() => {
    const options: ChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { rtl: this.rtl() },
      },
    };

    if (this.kind() === 'bar') {
      options.scales = {
        x: { reverse: this.rtl(), grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 } },
      };
    }
    return options;
  });

  // "To Do: 42, In Progress: 25, Done: 89"
  protected readonly summary = computed(() =>
    this.items()
      .map((item) => `${item.label}: ${item.count}`)
      .join(', '),
  );
}
