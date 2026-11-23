import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { debounce, filter, of, timer } from 'rxjs';
import { SearchScope } from '../models/search.model';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * The header search, shared by the pages that list things.
 * Each route says what the search looks through with `data: { search: 'tasks' }`;
 * pages without it (Analytics, Settings) hide the search box.
 * The text is cleared on every navigation, so a search on one page doesn't filter the next.
 */
@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly router = inject(Router);

  readonly text = signal('');
  readonly scope = signal<SearchScope | null>(null);

  // Typing waits for a pause before filtering; clearing the search applies at once
  readonly query = toSignal(
    toObservable(computed(() => this.text().trim())).pipe(
      debounce((value) => (value ? timer(SEARCH_DEBOUNCE_MS) : of(value))),
    ),
    { initialValue: '' },
  );

  readonly isActive = computed(() => this.text().trim() !== '');

  constructor() {
    // The service can start after the first navigation has already finished
    this.scope.set(this.readScope());

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.text.set('');
        this.scope.set(this.readScope());
      });
  }

  clear() {
    this.text.set('');
  }

  private readScope(): SearchScope | null {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data['search'] ?? null;
  }
}
