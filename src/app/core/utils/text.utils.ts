const ARABIC_DIACRITICS = /[ً-ٰٟـ]/g;
const LATIN_ACCENTS = /[̀-ͯ]/g;

const ARABIC_LETTER_VARIANTS: Record<string, string> = {
  أ: 'ا',
  إ: 'ا',
  آ: 'ا',
  ٱ: 'ا',
  ى: 'ي',
  ئ: 'ي',
  ؤ: 'و',
  ة: 'ه',
};

/**
 * Prepares text for a forgiving search, so people find a task however they type it:
 * - ignores case, extra spaces and Latin accents ("Café" matches "cafe");
 * - ignores Arabic diacritics and tatweel ("مُهِمّة" and "مهـمة" match "مهمة");
 * - treats Arabic letter variants as one letter (أ إ آ → ا, ى → ي, ة → ه, ؤ → و, ئ → ي);
 * - reads Arabic-Indic digits as Latin digits ("٢٠٢٦" matches "2026").
 */
export function normalizeSearchText(text: string) {
  return text
    .normalize('NFD')
    .replace(LATIN_ACCENTS, '')
    .normalize('NFC')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[أإآٱىئؤة]/g, (letter) => ARABIC_LETTER_VARIANTS[letter])
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
