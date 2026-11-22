const DAY_IN_MS = 24 * 60 * 60 * 1000;

// toISOString() would use UTC and shift dates around midnight
export function toIsoDate(date: Date) {
  return date.toLocaleDateString('en-CA');
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_IN_MS);
}
