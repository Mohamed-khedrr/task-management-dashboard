import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { ChartItem, ChartKind } from '../../../../core/models/chart.model';
import { ChartLegendComponent } from '../chart-legend/chart-legend.component';

let nextId = 0;

/**
 * A titled card with one Chart.js chart and an HTML legend with counts.
 * The canvas gets a text summary as its label, so screen readers get the numbers.
 */
@Component({
  selector: 'app-chart-card',
  imports: [ChartModule, ChartLegendComponent],
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCardComponent {
  readonly title = input.required<string>();
  readonly kind = input.required<ChartKind>();
  readonly items = input.required<ChartItem[]>();
  readonly rtl = input(false);

  protected readonly titleId = `chart-card-${nextId++}`;
  protected readonly isDoughnut = computed(() => this.kind() === 'doughnut');
  protected readonly isHorizontal = computed(() => this.kind() === 'horizontalBar');

  // Chart.js has no horizontal bar type: it's a bar chart with the axes swapped
  protected readonly chartType = computed(() => (this.isDoughnut() ? 'doughnut' : 'bar'));

  protected readonly data = computed<ChartData>(() => ({
    labels: this.items().map((item) => item.label),
    datasets: [
      {
        data: this.items().map((item) => item.count),
        backgroundColor: this.items().map((item) => item.color),
        borderColor: '#ffffff',
        borderWidth: this.isDoughnut() ? 2 : 0,
        borderRadius: this.isDoughnut() ? 0 : 6,
        maxBarThickness: 48,
        // A ring instead of a full pie
        cutout: '65%',
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

    if (this.isHorizontal()) {
      options.indexAxis = 'y';
      options.scales = {
        x: { beginAtZero: true, reverse: this.rtl(), ticks: { precision: 0 } },
        y: { position: this.rtl() ? 'right' : 'left', grid: { display: false } },
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
