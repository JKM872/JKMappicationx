/**
 * Integration tests for twikit scraper
 * Run with: npm test
 */

import { TwikitScraper } from '../src/services/twikitScraper';
import { getPythonBridge, cleanupPythonBridge } from '../src/services/pythonBridge';

describe('TwikitScraper Integration', () => {
  let scraper: TwikitScraper | null = null;

  beforeAll(async () => {
    // Skip tests if credentials not configured
    if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_EMAIL || !process.env.TWITTER_PASSWORD) {
      console.warn('⚠️ Skipping twikit tests - credentials not configured');
      return;
    }

    scraper = new TwikitScraper({
      username: process.env.TWITTER_USERNAME,
      email: process.env.TWITTER_EMAIL,
      password: process.env.TWITTER_PASSWORD
    });
  });

  afterAll(async () => {
    if (scraper) {
      scraper.cleanup();
    }
    cleanupPythonBridge();
  });

  it('should start Python bridge', async () => {
    if (!scraper) return;

    const bridge = getPythonBridge();
    await bridge.start();

    expect(bridge.getIsReady()).toBe(true);
  }, 15000);

  it('should search for tweets', async () => {
    if (!scraper) return;

    const posts = await scraper.search('AI', 5);

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]).toHaveProperty('id');
    expect(posts[0]).toHaveProperty('text');
    expect(posts[0]).toHaveProperty('author');
    expect(posts[0]).toHaveProperty('platform', 'twitter');
  }, 30000);

  it('should handle search errors gracefully', async () => {
    if (!scraper) return;

    // Search with very specific query unlikely to return results
    const posts = await scraper.search('xyzabc123nonexistent', 5);

    expect(Array.isArray(posts)).toBe(true);
    // May return empty array, which is fine
  }, 30000);
});

describe('PythonBridge', () => {
  afterEach(() => {
    cleanupPythonBridge();
  });

  it('should start and receive ready signal', async () => {
    const bridge = getPythonBridge();
    await bridge.start();

    expect(bridge.getIsReady()).toBe(true);

    bridge.cleanup();
  }, 15000);

  it('should handle process cleanup', () => {
    const bridge = getPythonBridge();
    bridge.cleanup();

    expect(bridge.getIsReady()).toBe(false);
    expect(bridge.getIsInitialized()).toBe(false);
  });
});
