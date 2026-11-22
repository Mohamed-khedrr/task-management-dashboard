const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Formats a date as local `YYYY-MM-DD`.
 * `toISOString()` would use UTC and shift the date around midnight.
 */
export function toIsoDate(date: Date) {
  return date.toLocaleDateString('en-CA');
}

/** Whole days from one date to another; negative when `to` is earlier. Rounded to absorb DST hours. */
export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_IN_MS);
}
