import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Like `Validators.required`, but also rejects text that is only spaces. */
export function requiredText(control: AbstractControl<string>): ValidationErrors | null {
  if (control.value?.trim()) {
    return null;
  }
  return { required: true };
}

/**
 * Limits the length of each item in a list control, such as tags.
 * `Validators.maxLength` would check the number of items instead.
 * @returns `{ itemTooLong: { max } }` when any item is longer than `max`
 */
export function maxItemLength(max: number): ValidatorFn {
  return (control: AbstractControl<string[]>) => {
    const tooLong = control.value.some((item) => item.trim().length > max);
    if (!tooLong) {
      return null;
    }
    return { itemTooLong: { max } };
  };
}
