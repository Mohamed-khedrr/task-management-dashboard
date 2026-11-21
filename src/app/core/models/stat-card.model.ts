export type StatTone = 'positive' | 'neutral' | 'negative';

export interface StatCard {
  icon: string;
  labelKey: string;
  value: number;
  changeKey: string;
  changeCount: number;
  tone: StatTone;
}
