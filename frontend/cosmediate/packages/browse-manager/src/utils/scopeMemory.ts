/**
 * Scope Memory Manager
 *
 * Provides deterministic, bounded, and idempotent memory management
 * for cross-cutting concerns (filters, pagination, preferences).
 */

// ============================================
// TYPES
// ============================================

export interface ScopeMemoryEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface ScopeMemoryOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
}

// ============================================
// DETERMINISTIC KEY GENERATION
// ============================================

/**
 * Generates deterministic keys from scope strings
 * - Normalizes whitespace and case
 * - Removes invalid characters
 * - Ensures consistent hashing
 */
export function generateScopeKey(scope: string): string {
  return scope
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Validates scope keys for determinism
 */
export function isValidScopeKey(key: string): boolean {
  return /^[a-z0-9_-]+$/.test(key) && key.length > 0 && key.length <= 100;
}

// ============================================
// LRU CACHE IMPLEMENTATION
// ============================================

class LRUCache<T> {
  private cache = new Map<string, ScopeMemoryEntry<T>>();
  private maxSize: number;
  private ttl: number;

  constructor(options: ScopeMemoryOptions = {}) {
    this.maxSize = options.maxSize || 50;
    this.ttl = options.ttl || 30 * 60 * 1000; // 30 minutes default
  }

  /**
   * Get entry with LRU update and TTL check
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  /**
   * Set entry with size management
   */
  set(key: string, data: T): void {
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add new entry
    const entry: ScopeMemoryEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);

    // Enforce size limit
    if (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }

  /**
   * Delete specific entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys (for debugging)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key));
    return expiredKeys.length;
  }
}

// ============================================
// SCOPE MEMORY MANAGER
// ============================================

export class ScopeMemoryManager<T> {
  private cache: LRUCache<T>;
  private namespace: string;

  constructor(namespace: string, options: ScopeMemoryOptions = {}) {
    this.namespace = generateScopeKey(namespace);
    this.cache = new LRUCache<T>(options);
  }

  /**
   * Get state with deterministic key handling
   */
  get(scope: string): T | undefined {
    const key = this.buildKey(scope);
    return this.cache.get(key);
  }

  /**
   * Set state with deterministic key handling
   */
  set(scope: string, data: T): void {
    const key = this.buildKey(scope);
    this.cache.set(key, data);
  }

  /**
   * Delete state
   */
  delete(scope: string): boolean {
    const key = this.buildKey(scope);
    return this.cache.delete(key);
  }

  /**
   * Check if state exists
   */
  has(scope: string): boolean {
    const key = this.buildKey(scope);
    return this.cache.get(key) !== undefined;
  }

  /**
   * Clear all states
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    return this.cache.cleanup();
  }

  /**
   * Build deterministic key
   */
  private buildKey(scope: string): string {
    const scopeKey = generateScopeKey(scope);
    if (!isValidScopeKey(scopeKey)) {
      throw new Error(`Invalid scope key: "${scope}" -> "${scopeKey}"`);
    }
    return `${this.namespace}:${scopeKey}`;
  }

  /**
   * Debug information
   */
  debug(): {
    namespace: string;
    size: number;
    keys: string[];
    cleanupExpired: number;
  } {
    return {
      namespace: this.namespace,
      size: this.cache.size,
      keys: this.cache.keys(),
      cleanupExpired: this.cache.cleanup(),
    };
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create a memory manager for filters
 */
export function createFiltersMemoryManager(options?: ScopeMemoryOptions) {
  return new ScopeMemoryManager<any>("filters", {
    maxSize: 20,
    ttl: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
}

/**
 * Create a memory manager for pagination
 */
export function createPaginationMemoryManager(options?: ScopeMemoryOptions) {
  return new ScopeMemoryManager<any>("pagination", {
    maxSize: 30,
    ttl: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Create a memory manager for preferences
 */
export function createPreferencesMemoryManager(options?: ScopeMemoryOptions) {
  return new ScopeMemoryManager<any>("preferences", {
    maxSize: 15,
    ttl: 60 * 60 * 1000, // 1 hour
    ...options,
  });
}

// ============================================
// GLOBAL CLEANUP
// ============================================

// Periodic cleanup to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const managers = new Set<ScopeMemoryManager<any>>();

function globalCleanup(): void {
  managers.forEach((manager) => {
    try {
      manager.cleanup();
    } catch (error) {
      console.warn("Scope memory cleanup failed:", error);
    }
  });
}

// Register manager for global cleanup
export function registerManager(manager: ScopeMemoryManager<any>): void {
  managers.add(manager);

  // Start cleanup interval on first registration
  if (managers.size === 1) {
    setInterval(globalCleanup, CLEANUP_INTERVAL);
  }
}

// Unregister manager
export function unregisterManager(manager: ScopeMemoryManager<any>): void {
  managers.delete(manager);
}
