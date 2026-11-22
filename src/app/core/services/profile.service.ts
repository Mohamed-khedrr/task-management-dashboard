import { computed, Injectable, isDevMode, signal } from '@angular/core';

const STORAGE_KEY = 'profileName';

// "Mohamed Ali Khedr" → "MK": the first letter of the first and the last name
function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '';
  }

  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

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
