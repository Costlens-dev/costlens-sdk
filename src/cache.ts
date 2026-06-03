import { CacheEntry } from './types';

const MAX_CACHE_SIZE = 1000;
const EVICTION_RATIO = 0.2;

/**
 * LRU cache for deduplicating identical LLM requests.
 */
export class LRUCache {
  private store = new Map<string, CacheEntry>();

  get(key: string): any | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    entry.lastAccessed = Date.now();
    return entry.result;
  }

  set(key: string, result: any, ttl: number = 3600000): void {
    if (this.store.size >= MAX_CACHE_SIZE) {
      this.evict();
    }

    this.store.set(key, {
      result,
      timestamp: Date.now(),
      ttl,
      lastAccessed: Date.now(),
    });
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  private evict(): void {
    const entries = Array.from(this.store.entries());
    entries.sort((a, b) => (a[1].lastAccessed || 0) - (b[1].lastAccessed || 0));

    const toRemove = Math.floor(MAX_CACHE_SIZE * EVICTION_RATIO);
    for (let i = 0; i < toRemove; i++) {
      this.store.delete(entries[i][0]);
    }
  }
}

/**
 * Generate a stable cache key from provider + params.
 */
export function getCacheKey(provider: string, params: any): string {
  const normalized = {
    model: params.model,
    messages: params.messages?.map((m: any) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content.trim() : m.content,
    })),
    temperature: params.temperature || 0.7,
    max_tokens: params.max_tokens,
  };

  return `${provider}:${JSON.stringify(normalized)}`;
}
