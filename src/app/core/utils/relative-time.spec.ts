import { formatDayCount, formatRelativeDays, formatTimeAgo } from './relative-time';

describe('formatRelativeDays', () => {
  it('uses natural words for nearby days', () => {
    expect(formatRelativeDays(0, 'en')).toBe('today');
    expect(formatRelativeDays(1, 'en')).toBe('tomorrow');
    expect(formatRelativeDays(-1, 'en')).toBe('yesterday');
    expect(formatRelativeDays(3, 'en')).toBe('in 3 days');
  });

  it('uses weeks for exact weeks, keeping "in 1 week"', () => {
    expect(formatRelativeDays(7, 'en')).toBe('in 1 week');
    expect(formatRelativeDays(14, 'en')).toBe('in 2 weeks');
    expect(formatRelativeDays(-7, 'en')).toBe('1 week ago');
  });

  it('switches to rounded weeks from 4 weeks on and never back to days', () => {
    expect(formatRelativeDays(27, 'en')).toBe('in 27 days');
    expect(formatRelativeDays(29, 'en')).toBe('in 4 weeks');
    expect(formatRelativeDays(34, 'en')).toBe('in 5 weeks');
    expect(formatRelativeDays(-34, 'en')).toBe('5 weeks ago');
  });
});

describe('formatDayCount', () => {
  it('counts days, or weeks when the days make whole or long durations', () => {
    expect(formatDayCount(1, 'en')).toBe('1 day');
    expect(formatDayCount(2, 'en')).toBe('2 days');
    expect(formatDayCount(14, 'en')).toBe('2 weeks');
    expect(formatDayCount(30, 'en')).toBe('4 weeks');
  });
});

describe('formatTimeAgo', () => {
  const now = new Date('2026-11-21T12:00:00');

  it('says "now" for the last minute, and for times slightly in the future', () => {
    expect(formatTimeAgo('2026-11-21T11:59:30', now, 'en')).toBe('now');
    expect(formatTimeAgo('2026-11-21T12:00:10', now, 'en')).toBe('now');
  });

  it('uses minutes, then hours within the same day', () => {
    expect(formatTimeAgo('2026-11-21T11:55:00', now, 'en')).toBe('5 minutes ago');
    expect(formatTimeAgo('2026-11-21T09:00:00', now, 'en')).toBe('3 hours ago');
  });

  it('uses days and weeks after a day', () => {
    expect(formatTimeAgo('2026-11-20T10:00:00', now, 'en')).toBe('yesterday');
    expect(formatTimeAgo('2026-11-07T12:00:00', now, 'en')).toBe('2 weeks ago');
  });
});
