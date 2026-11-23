const DAYS_IN_WEEK = 7;
const WEEKS_FROM_DAYS = 28;

/**
 * Weeks read better than days for exact weeks ("in 2 weeks") and for long spans
 * (4 weeks or more, rounded). Returns null when days should be used.
 */
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

/**
 * Localized relative time from a day offset: "today", "in 3 days", "2 weeks ago".
 * @param days positive for the future, negative for the past
 */
export function formatRelativeDays(days: number, lang: string) {
  const weeks = toWeeks(days);
  if (weeks !== null) {
    return new Intl.RelativeTimeFormat(lang, { numeric: 'always' }).format(weeks, 'week');
  }
  return new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(days, 'day');
}

/** Localized duration without direction: "1 day", "3 days", "2 weeks". */
export function formatDayCount(days: number, lang: string) {
  const weeks = toWeeks(days);
  const unit = weeks !== null ? 'week' : 'day';
  const value = Math.abs(weeks ?? days);

  return new Intl.NumberFormat(lang, { style: 'unit', unit, unitDisplay: 'long' }).format(value);
}

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

/** Localized time since a moment: "now", "5 minutes ago", "3 hours ago", "yesterday". */
export function formatTimeAgo(at: string, now: Date, lang: string) {
  const elapsed = Math.max(0, now.getTime() - Date.parse(at));
  const format = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

  if (elapsed < MINUTE_IN_MS) {
    return format.format(0, 'second');
  }
  if (elapsed < HOUR_IN_MS) {
    return format.format(-Math.floor(elapsed / MINUTE_IN_MS), 'minute');
  }
  if (elapsed < DAY_IN_MS) {
    return format.format(-Math.floor(elapsed / HOUR_IN_MS), 'hour');
  }
  return formatRelativeDays(-Math.floor(elapsed / DAY_IN_MS), lang);
}
