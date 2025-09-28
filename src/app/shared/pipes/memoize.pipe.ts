import { Pipe, PipeTransform } from '@angular/core';

/**
 * Memoization pipe to cache expensive computations
 * Improves performance by avoiding redundant calculations
 */
@Pipe({
  name: 'memoize',
  pure: true,
  standalone: true
})
export class MemoizePipe implements PipeTransform {
  private static cache = new Map<string, any>();
  private static readonly MAX_CACHE_SIZE = 100;

  transform<T, R>(value: T, fn: (value: T) => R, ...args: any[]): R {
    // Create a unique cache key based on function name, value, and arguments
    const cacheKey = this.createCacheKey(fn, value, args);
    
    // Check if result is already cached
    if (MemoizePipe.cache.has(cacheKey)) {
      return MemoizePipe.cache.get(cacheKey);
    }

    // Compute the result
    const result = fn(value);
    
    // Store in cache with size limit
    this.addToCache(cacheKey, result);
    
    return result;
  }

  private createCacheKey<T>(fn: Function, value: T, args: any[]): string {
    const fnName = fn.name || 'anonymous';
    const valueKey = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const argsKey = args.length > 0 ? JSON.stringify(args) : '';
    
    return `${fnName}_${valueKey}_${argsKey}`;
  }

  private addToCache(key: string, value: any): void {
    // Implement LRU cache behavior
    if (MemoizePipe.cache.size >= MemoizePipe.MAX_CACHE_SIZE) {
      // Remove the oldest entry
      const firstKey = MemoizePipe.cache.keys().next().value;
      MemoizePipe.cache.delete(firstKey);
    }
    
    MemoizePipe.cache.set(key, value);
  }

  /**
   * Clear the entire cache (useful for testing or memory management)
   */
  static clearCache(): void {
    MemoizePipe.cache.clear();
  }

  /**
   * Remove specific entries from cache
   */
  static invalidatePattern(pattern: string): void {
    const keysToDelete = Array.from(MemoizePipe.cache.keys())
      .filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => MemoizePipe.cache.delete(key));
  }
}