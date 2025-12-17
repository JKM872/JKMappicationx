/**
 * Cache Service
 * Redis-based caching with graceful degradation if Redis is unavailable
 */

import { TwitterPost } from '../types';

// Redis types (will be installed later)
type RedisClientType = any;

export interface CacheConfig {
  ttl?: number; // Time to live in seconds (default: 24 hours)
  enabled?: boolean;
  redisUrl?: string;
}

export class CacheService {
  private client: RedisClientType | null = null;
  private config: Required<CacheConfig>;
  private isConnected = false;
  private memoryCache = new Map<string, { data: any; expires: number }>();

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: config.ttl || 86400, // 24 hours default
      enabled: config.enabled !== false,
      redisUrl: config.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379'
    };
  }

  /**
   * Initialize Redis connection (optional)
   */
  async connect(): Promise<void> {
    if (!this.config.enabled) {
      console.log('[CacheService] Caching disabled');
      return;
    }

    try {
      // Try to load redis module
      const redis = await import('redis');
      
      this.client = redis.createClient({
        url: this.config.redisUrl
      });

      this.client.on('error', (err: Error) => {
        console.error('[CacheService] Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('[CacheService] Redis connected');
        this.isConnected = true;
      });

      await this.client.connect();
      
    } catch (error: any) {
      console.warn('[CacheService] Redis not available, using memory cache:', error.message);
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Get cached data
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      // Try Redis first
      if (this.isConnected && this.client) {
        const data = await this.client.get(key);
        if (data) {
          return JSON.parse(data) as T;
        }
      }

      // Fallback to memory cache
      const cached = this.memoryCache.get(key);
      if (cached) {
        if (Date.now() < cached.expires) {
          return cached.data as T;
        } else {
          this.memoryCache.delete(key);
        }
      }

      return null;
    } catch (error: any) {
      console.error('[CacheService] Get error:', error.message);
      return null;
    }
  }

  /**
   * Set cached data
   */
  async set<T = any>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const cacheTtl = ttl || this.config.ttl;

    try {
      const serialized = JSON.stringify(data);

      // Try Redis first
      if (this.isConnected && this.client) {
        await this.client.setEx(key, cacheTtl, serialized);
      }

      // Always set in memory cache as fallback
      this.memoryCache.set(key, {
        data,
        expires: Date.now() + cacheTtl * 1000
      });

      // Clean up expired memory cache entries periodically
      if (Math.random() < 0.1) { // 10% chance
        this.cleanMemoryCache();
      }

    } catch (error: any) {
      console.error('[CacheService] Set error:', error.message);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      }
      this.memoryCache.delete(key);
    } catch (error: any) {
      console.error('[CacheService] Delete error:', error.message);
    }
  }

  /**
   * Delete all cached data matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }

      // Clear matching keys from memory cache
      for (const key of this.memoryCache.keys()) {
        if (this.matchPattern(key, pattern)) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error: any) {
      console.error('[CacheService] Delete pattern error:', error.message);
    }
  }

  /**
   * Flush all cached data
   */
  async flush(): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushDb();
      }
      this.memoryCache.clear();
      console.log('[CacheService] Cache flushed');
    } catch (error: any) {
      console.error('[CacheService] Flush error:', error.message);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { redis: boolean; memoryKeys: number } {
    return {
      redis: this.isConnected,
      memoryKeys: this.memoryCache.size
    };
  }

  /**
   * Clean up expired entries from memory cache
   */
  private cleanMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (now >= value.expires) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Match a key against a pattern (simple glob-style matching)
   */
  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(key);
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        console.log('[CacheService] Disconnected from Redis');
      } catch (error: any) {
        console.error('[CacheService] Disconnect error:', error.message);
      }
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Generate cache key for Twitter search
   */
  static twitterSearchKey(query: string, limit: number): string {
    return `twitter:search:${query.toLowerCase()}:${limit}`;
  }

  /**
   * Generate cache key for Twitter trending
   */
  static twitterTrendingKey(limit: number): string {
    return `twitter:trending:${limit}`;
  }
}

// Singleton instance
let cacheInstance: CacheService | null = null;

/**
 * Get or create the global cache instance
 */
export function getCacheService(): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService();
  }
  return cacheInstance;
}

/**
 * Clean up the global cache instance
 */
export async function cleanupCacheService(): Promise<void> {
  if (cacheInstance) {
    await cacheInstance.disconnect();
    cacheInstance = null;
  }
}
