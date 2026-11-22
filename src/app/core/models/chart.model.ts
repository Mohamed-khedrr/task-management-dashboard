export type ChartKind = 'doughnut' | 'bar' | 'horizontalBar';

export interface ChartItem {
  label: string;
  count: number;
  color: string;
}

export interface ChartSeries {
  label: string;
  values: number[];
  color: string;
}
