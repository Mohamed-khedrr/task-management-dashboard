import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SearchService } from './search.service';

@Component({ template: '' })
class EmptyPage {}

describe('SearchService', () => {
  let service: SearchService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dashboard', component: EmptyPage, data: { search: 'tasks' } },
          { path: 'team', component: EmptyPage, data: { search: 'team' } },
          { path: 'settings', component: EmptyPage },
        ]),
      ],
    });
    service = TestBed.inject(SearchService);
    router = TestBed.inject(Router);
  });

  afterEach(() => vi.useRealTimers());

  it('knows what the open page searches, and nothing on pages without a search', async () => {
    await router.navigateByUrl('/team');
    expect(service.scope()).toBe('team');

    await router.navigateByUrl('/settings');
    expect(service.scope()).toBeNull();
  });

  it('clears the search when moving to another page', async () => {
    await router.navigateByUrl('/dashboard');
    service.text.set('report');

    await router.navigateByUrl('/team');

    expect(service.text()).toBe('');
  });

  it('applies a search only after typing pauses', () => {
    vi.useFakeTimers();
    service.text.set('report');
    TestBed.tick();

    vi.advanceTimersByTime(299);
    expect(service.query()).toBe('');

    vi.advanceTimersByTime(1);
    expect(service.query()).toBe('report');
  });

  it('applies clearing the search immediately', () => {
    vi.useFakeTimers();
    service.text.set('report');
    TestBed.tick();
    vi.advanceTimersByTime(300);

    service.clear();
    TestBed.tick();

    expect(service.query()).toBe('');
  });
});
