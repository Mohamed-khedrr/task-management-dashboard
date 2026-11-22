import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { ChartItem, ChartSeries } from '../../../../core/models/chart.model';
import { ChartLegendComponent } from '../chart-legend/chart-legend.component';

const COLUMN_WIDTH = 96;
let nextId = 0;

@Component({
  selector: 'app-stacked-bar-card',
  imports: [ChartModule, ChartLegendComponent],
  templateUrl: './stacked-bar-card.component.html',
  styleUrl: './stacked-bar-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackedBarCardComponent {
  readonly title = input.required<string>();
  readonly labels = input.required<string[]>();
  readonly series = input.required<ChartSeries[]>();
  readonly rtl = input(false);

  protected readonly titleId = `stacked-bar-card-${nextId++}`;

  protected readonly data = computed<ChartData>(() => ({
    labels: this.labels(),
    datasets: this.series().map((series) => ({
      label: series.label,
      data: series.values,
      backgroundColor: series.color,
      borderWidth: 0,
      borderRadius: 4,
      maxBarThickness: 48,
    })),
  }));

  // Each column gets a fixed width, so with many labels the chart scrolls sideways instead of squeezing
  protected readonly chartWidth = computed(() => this.labels().length * COLUMN_WIDTH);

  protected readonly options = computed<ChartOptions>(() => ({
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { rtl: this.rtl() },
    },
    scales: {
      x: { stacked: true, reverse: this.rtl(), grid: { display: false } },
      y: {
        stacked: true,
        beginAtZero: true,
        position: this.rtl() ? 'right' : 'left',
        ticks: { precision: 0 },
      },
    },
  }));

  // The legend shows each layer with its total
  protected readonly legend = computed<ChartItem[]>(() =>
    this.series().map((series) => ({
      label: series.label,
      count: series.values.reduce((sum, value) => sum + value, 0),
      color: series.color,
    })),
  );

  // "Sarah Smith: 2 To Do, 1 In Progress, 3 Done; John Doe: …"
  protected readonly summary = computed(() =>
    this.labels()
      .map((label, index) => {
        const parts = this.series().map((series) => `${series.values[index]} ${series.label}`);
        return `${label}: ${parts.join(', ')}`;
      })
      .join('; '),
  );
}
