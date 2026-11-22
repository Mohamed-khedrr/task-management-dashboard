import { FormControl } from '@angular/forms';
import { maxItemLength, requiredText } from './form.validators';

describe('form validators', () => {
  describe('requiredText', () => {
    const text = (value: string) => new FormControl(value, { nonNullable: true });

    it('rejects empty and whitespace-only text', () => {
      expect(requiredText(text(''))).toEqual({ required: true });
      expect(requiredText(text('   '))).toEqual({ required: true });
    });

    it('accepts real text', () => {
      expect(requiredText(text(' Write report '))).toBeNull();
    });
  });

  describe('maxItemLength', () => {
    const list = (...values: string[]) => new FormControl(values, { nonNullable: true });

    it('accepts items within the limit', () => {
      expect(maxItemLength(5)(list('Docs', 'API'))).toBeNull();
    });

    it('rejects a list with an item over the limit', () => {
      expect(maxItemLength(5)(list('Docs', 'Backend'))).toEqual({ itemTooLong: { max: 5 } });
    });
  });
});
