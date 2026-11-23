import { normalizeSearchText } from './text.utils';

describe('normalizeSearchText', () => {
  it('ignores case, extra spaces and accents', () => {
    expect(normalizeSearchText('  Café   MENU ')).toBe('cafe menu');
  });

  it('ignores Arabic diacritics and tatweel', () => {
    expect(normalizeSearchText('مُهِمّة')).toBe(normalizeSearchText('مهمة'));
    expect(normalizeSearchText('مهـــمة')).toBe(normalizeSearchText('مهمة'));
  });

  it('treats the different forms of an Arabic letter as the same letter', () => {
    expect(normalizeSearchText('إضافة')).toBe(normalizeSearchText('اضافه'));
    expect(normalizeSearchText('أمان')).toBe(normalizeSearchText('امان'));
    expect(normalizeSearchText('مستوى')).toBe(normalizeSearchText('مستوي'));
  });

  it('reads Arabic-Indic digits as Latin digits', () => {
    expect(normalizeSearchText('تقرير ٢٠٢٦')).toBe(normalizeSearchText('تقرير 2026'));
  });
});
