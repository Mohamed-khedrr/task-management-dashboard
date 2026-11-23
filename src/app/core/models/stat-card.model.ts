export type StatTone = 'positive' | 'neutral' | 'negative';

export interface StatCard {
  icon: string;
  labelKey: string;
  value: number;
  changeKey: string;
  // Shown instead of "+0 today" when nothing changed
  noChangeKey: string;
  changeCount: number;
  tone: StatTone;
}
