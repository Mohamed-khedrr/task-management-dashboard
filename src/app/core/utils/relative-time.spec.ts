import { formatDayCount, formatRelativeDays } from './relative-time';

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
