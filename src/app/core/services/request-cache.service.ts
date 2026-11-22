import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

const CACHE_LIFETIME_MS = 5 * 60 * 1000;

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiresAt: number;
}

/** In-memory store for GET responses, keyed by URL with params, kept for 5 minutes. */
@Injectable({
  providedIn: 'root',
})
export class RequestCacheService {
  private readonly entries = new Map<string, CacheEntry>();

  get(url: string) {
    const entry = this.entries.get(url);
    if (!entry) return undefined;

    if (entry.expiresAt < Date.now()) {
      this.entries.delete(url);
      return undefined;
    }
    return entry.response;
  }

  set(url: string, response: HttpResponse<unknown>) {
    this.entries.set(url, { response, expiresAt: Date.now() + CACHE_LIFETIME_MS });
  }

  clear() {
    this.entries.clear();
  }
}
