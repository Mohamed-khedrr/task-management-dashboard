import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validators.required lets "   " through
export function requiredText(control: AbstractControl<string>): ValidationErrors | null {
  if (control.value?.trim()) {
    return null;
  }
  return { required: true };
}

// Validators.maxLength checks the list length, not the length of each item
export function maxItemLength(max: number): ValidatorFn {
  return (control: AbstractControl<string[]>) => {
    const tooLong = control.value.some((item) => item.trim().length > max);
    if (!tooLong) {
      return null;
    }
    return { itemTooLong: { max } };
  };
}
