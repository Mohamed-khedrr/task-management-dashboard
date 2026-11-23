import { computed, Injectable, isDevMode, signal } from '@angular/core';
import { getInitials } from '../utils/name.utils';

const STORAGE_KEY = 'profileName';

function readStoredName() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly nameState = signal(readStoredName());

  readonly name = this.nameState.asReadonly();
  readonly initials = computed(() => getInitials(this.name()));

  setName(name: string) {
    const trimmed = name.trim();
    this.nameState.set(trimmed);

    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } catch (error) {
      if (isDevMode()) console.warn('Could not save the profile name', error);
    }
  }
}
