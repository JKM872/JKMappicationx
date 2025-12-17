/**
 * Twikit Scraper Service
 * High-level wrapper around Python bridge for Twitter scraping
 */

import { getPythonBridge, cleanupPythonBridge } from './pythonBridge';
import { TwitterPost } from '../types';

export interface TwikitConfig {
  username: string;
  email: string;
  password: string;
  timeout?: number;
  retries?: number;
}

export class TwikitScraper {
  private config: TwikitConfig;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(config: TwikitConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 20000,
      retries: config.retries || 2
    };
  }

  /**
   * Initialize the scraper (lazy initialization)
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Prevent multiple simultaneous initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        const bridge = getPythonBridge();

        // Start the bridge if not already started
        if (!bridge.getIsReady()) {
          console.log('[TwikitScraper] Starting Python bridge...');
          await bridge.start();
        }

        // Initialize with Twitter credentials
        if (!bridge.getIsInitialized()) {
          console.log('[TwikitScraper] Initializing Twitter client...');
          const result = await bridge.initialize(
            this.config.username,
            this.config.email,
            this.config.password
          );

          if (!result.success) {
            throw new Error(result.error || 'Failed to initialize Twitter client');
          }
        }

        this.isInitialized = true;
        console.log('[TwikitScraper] Initialized successfully');
      } catch (error) {
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Search for tweets matching a query
   */
  async search(query: string, limit: number = 20): Promise<TwitterPost[]> {
    try {
      await this.ensureInitialized();

      const bridge = getPythonBridge();
      const result = await bridge.search(query, limit);

      if (!result.success) {
        throw new Error(result.error || 'Search failed');
      }

      // Convert Python response to TwitterPost format
      const posts: TwitterPost[] = result.tweets.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
        author: tweet.author,
        username: tweet.username,
        timestamp: tweet.timestamp,
        url: tweet.url,
        platform: 'twitter' as const,
        image: tweet.images && tweet.images.length > 0 ? tweet.images[0] : undefined,
        score: tweet.likes + tweet.retweets * 2, // Weight retweets more
        likes: tweet.likes,
        retweets: tweet.retweets,
        replies: tweet.replies,
        views: tweet.views
      }));

      console.log(`[TwikitScraper] Found ${posts.length} tweets for query: ${query}`);
      return posts;

    } catch (error: any) {
      console.error('[TwikitScraper] Search error:', error.message);
      throw error;
    }
  }

  /**
   * Get trending topics/tweets
   */
  async trending(limit: number = 20): Promise<any[]> {
    try {
      await this.ensureInitialized();

      const bridge = getPythonBridge();
      const result = await bridge.trending(limit);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch trending');
      }

      console.log(`[TwikitScraper] Found ${result.trends.length} trending topics`);
      return result.trends;

    } catch (error: any) {
      console.error('[TwikitScraper] Trending error:', error.message);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    cleanupPythonBridge();
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Singleton instance
let scraperInstance: TwikitScraper | null = null;

/**
 * Get or create the global TwikitScraper instance
 */
export function getTwikitScraper(): TwikitScraper | null {
  // Only create if credentials are available
  const username = process.env.TWITTER_USERNAME;
  const email = process.env.TWITTER_EMAIL;
  const password = process.env.TWITTER_PASSWORD;

  if (!username || !email || !password) {
    const missing: string[] = [];
    if (!username) missing.push('TWITTER_USERNAME');
    if (!email) missing.push('TWITTER_EMAIL');
    if (!password) missing.push('TWITTER_PASSWORD');
    
    console.warn(`[TwikitScraper] ⚠️ Twitter/X credentials not configured.`);
    console.warn(`[TwikitScraper] Missing environment variables: ${missing.join(', ')}`);
    console.warn(`[TwikitScraper] To enable Twitter/X scraping, add these to your .env file:`);
    console.warn(`[TwikitScraper]   TWITTER_USERNAME=your_username`);
    console.warn(`[TwikitScraper]   TWITTER_EMAIL=your_email@example.com`);
    console.warn(`[TwikitScraper]   TWITTER_PASSWORD=your_password`);
    return null;
  }

  if (!scraperInstance) {
    console.log(`[TwikitScraper] ✅ Twitter credentials found for user: ${username}`);
    scraperInstance = new TwikitScraper({
      username,
      email,
      password
    });
  }

  return scraperInstance;
}

/**
 * Clean up the global scraper instance
 */
export function cleanupTwikitScraper(): void {
  if (scraperInstance) {
    scraperInstance.cleanup();
    scraperInstance = null;
  }
}
