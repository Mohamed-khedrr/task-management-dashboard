const DAYS_IN_WEEK = 7;
const WEEKS_THRESHOLD_DAYS = 30;

function toWeeks(days: number): number | null {
  const abs = Math.abs(days);

  if (abs > WEEKS_THRESHOLD_DAYS) {
    return Math.sign(days) * Math.floor(abs / DAYS_IN_WEEK);
  }
  if (abs !== 0 && abs % DAYS_IN_WEEK === 0) {
    return days / DAYS_IN_WEEK;
  }
  return null;
}

export function formatRelativeDays(days: number, lang: string) {
  const weeks = toWeeks(days);
  if (weeks !== null) {
    return new Intl.RelativeTimeFormat(lang, { numeric: 'always' }).format(weeks, 'week');
  }
  return new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(days, 'day');
}

export function formatDayCount(days: number, lang: string) {
  const weeks = toWeeks(days);
  const unit = weeks !== null ? 'week' : 'day';
  const value = Math.abs(weeks ?? days);

  return new Intl.NumberFormat(lang, { style: 'unit', unit, unitDisplay: 'long' }).format(value);
}
