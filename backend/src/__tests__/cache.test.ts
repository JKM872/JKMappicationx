/**
 * Cache service tests
 */

import { CacheService } from '../src/services/cacheService';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService({ enabled: true });
  });

  afterEach(async () => {
    await cache.disconnect();
  });

  it('should set and get data from memory cache', async () => {
    const testData = { foo: 'bar', num: 123 };
    
    await cache.set('test-key', testData, 60);
    const retrieved = await cache.get('test-key');

    expect(retrieved).toEqual(testData);
  });

  it('should return null for non-existent keys', async () => {
    const result = await cache.get('non-existent');
    expect(result).toBeNull();
  });

  it('should delete cached data', async () => {
    await cache.set('delete-test', { data: 'test' }, 60);
    
    let retrieved = await cache.get('delete-test');
    expect(retrieved).not.toBeNull();

    await cache.delete('delete-test');
    
    retrieved = await cache.get('delete-test');
    expect(retrieved).toBeNull();
  });

  it('should expire data after TTL', async () => {
    await cache.set('expire-test', { data: 'test' }, 1); // 1 second TTL
    
    let retrieved = await cache.get('expire-test');
    expect(retrieved).not.toBeNull();

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1500));

    retrieved = await cache.get('expire-test');
    expect(retrieved).toBeNull();
  }, 3000);

  it('should flush all data', async () => {
    await cache.set('key1', 'value1', 60);
    await cache.set('key2', 'value2', 60);

    await cache.flush();

    const result1 = await cache.get('key1');
    const result2 = await cache.get('key2');

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('should generate consistent cache keys', () => {
    const key1 = CacheService.twitterSearchKey('AI', 20);
    const key2 = CacheService.twitterSearchKey('ai', 20); // lowercase

    expect(key1).toBe('twitter:search:ai:20');
    expect(key2).toBe('twitter:search:ai:20');
  });

  it('should work with caching disabled', async () => {
    const disabledCache = new CacheService({ enabled: false });

    await disabledCache.set('test', 'data', 60);
    const result = await disabledCache.get('test');

    expect(result).toBeNull();
  });
});
