const DAYS_IN_WEEK = 7;
const WEEKS_FROM_DAYS = 28;

function toWeeks(days: number): number | null {
  const absDays = Math.abs(days);

  if (absDays >= WEEKS_FROM_DAYS) {
    return Math.sign(days) * Math.round(absDays / DAYS_IN_WEEK);
  }
  if (absDays !== 0 && absDays % DAYS_IN_WEEK === 0) {
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
