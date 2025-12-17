import { scrapeNitter, TwitterPost as NitterTwitterPost } from './nitterScraper';
import { searchTwitter, TwitterPost as UltimateTwitterPost } from './twitterScraper';
import { searchTwitterDirect } from './twitterDirectScraper';
import { scrapeReddit, RedditPost } from './redditScraper';
import { scrapeDevTo, DevToPost } from './devtoScraper';
import { scrapeThreads, ThreadsPost } from './threadsScraper';
import { getTwikitScraper } from './twikitScraper';
import { getCacheService, CacheService } from './cacheService';
import { TwitterPost } from '../types';

// Use NitterTwitterPost for internal scraping, convert to unified TwitterPost
type InternalTwitterPost = NitterTwitterPost;

export interface UnifiedPost {
  id: string;
  platform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads';
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: number;
  url: string;
  postUrl?: string;      // For Reddit compatibility
  subreddit?: string;    // For Reddit posts
  username?: string;     // For Threads posts
  reposts?: number;      // For Threads posts
  timestamp: string;
  image?: string;
  score: number;
  icon: string;
}

/**
 * Timeout wrapper - reject promise after specified milliseconds
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    )
  ]);
}

/**
 * Scrape Twitter with Direct Methods (NO COST!)
 * Priority: 1. Twitter Direct (guest token) -> 2. Twikit -> 3. Multi-source
 */
async function scrapeTwitterWithFallback(query: string, limit: number): Promise<InternalTwitterPost[]> {
  const cache = getCacheService();
  const cacheKey = CacheService.twitterSearchKey(query, limit);

  // Try cache first
  const cached = await cache.get<InternalTwitterPost[]>(cacheKey);
  if (cached && cached.length > 0) {
    console.log('✅ Twitter: Using cached data');
    return cached;
  }

  // ⚡ PRIORITY 1: Twitter Direct Scraper (NO AUTH, NO COST!)
  try {
    console.log('🐦 Twitter: Trying Direct Scraper (Guest Token)...');
    const directPosts = await searchTwitterDirect(query, limit);
    
    if (directPosts.length > 0) {
      // Convert to internal format
      const internalPosts: InternalTwitterPost[] = directPosts.map((p: any) => ({
        id: p.id,
        platform: 'Twitter' as const,
        author: p.author,
        handle: p.handle || `@${p.author}`,
        title: p.title,
        content: p.content,
        url: p.url,
        likes: p.likes,
        retweets: p.retweets,
        replies: p.replies,
        views: p.views,
        timestamp: p.timestamp,
        image: p.image,
        score: p.score
      }));
      
      console.log(`✅ Twitter Direct: ${internalPosts.length} REAL tweets`);
      await cache.set(cacheKey, internalPosts, 3600);
      return internalPosts;
    }
  } catch (error: any) {
    console.warn('⚠️ Twitter Direct failed:', error.message);
  }

  // ⚡ PRIORITY 2: Twikit (if credentials available)
  const twikitScraper = getTwikitScraper();
  if (twikitScraper) {
    try {
      console.log('🐦 Twitter: Trying Twikit (REAL Twitter API)...');
      const twikitPosts = await twikitScraper.search(query, limit);
      
      if (twikitPosts.length > 0) {
        const internalPosts: InternalTwitterPost[] = twikitPosts.map((p: any) => ({
          id: p.id,
          platform: 'Twitter' as const,
          author: p.author || p.username || 'Unknown',
          handle: `@${p.username || 'unknown'}`,
          title: (p.text || p.content || '').substring(0, 100),
          content: p.text || p.content || '',
          url: p.url || `https://twitter.com/i/status/${p.id}`,
          likes: p.likes || 0,
          retweets: p.retweets || 0,
          replies: p.replies || 0,
          views: p.views || 0,
          timestamp: p.timestamp || new Date().toISOString(),
          image: p.image,
          score: (p.likes || 0) + (p.retweets || 0) * 2 + (p.replies || 0)
        }));
        
        console.log(`✅ Twitter Twikit: ${internalPosts.length} tweets`);
        await cache.set(cacheKey, internalPosts, 3600);
        return internalPosts;
      }
    } catch (error: any) {
      console.warn('⚠️ Twitter Twikit failed:', error.message);
    }
  }

  // ⚡ PRIORITY 3: Multi-source scraper
  try {
    console.log('🔄 Twitter: Trying multi-source scraper...');
    const posts = await searchTwitter(query, limit);
    
    if (posts.length > 0) {
      const internalPosts: InternalTwitterPost[] = posts.map((p: UltimateTwitterPost) => ({
        id: p.id,
        platform: 'Twitter' as const,
        author: p.author,
        handle: p.handle,
        title: p.title,
        content: p.content,
        url: p.url,
        likes: p.likes,
        retweets: p.retweets,
        replies: p.replies,
        timestamp: p.timestamp,
        image: p.image,
        score: p.score
      }));
      
      await cache.set(cacheKey, internalPosts, 3600);
      return internalPosts;
    }
  } catch (error: any) {
    console.warn('⚠️ Twitter multi-source failed:', error.message);
  }

  // ⚡ PRIORITY 4: Legacy Nitter
  console.log('🔄 Twitter: Last resort - Nitter...');
  return await scrapeNitter(query, limit);
}

/**
 * Search all sources concurrently - 10X Power Edition
 */
export async function searchAllSources(
  query: string,
  limit: number = 20,
  platform: string = 'all'
): Promise<UnifiedPost[]> {
  console.log(`\n🚀 [10X] Multi-platform search: "${query}" (platform: ${platform})\n`);

  // Run only requested scrapers (or all if platform='all')
  const startTime = Date.now();
  const shouldScrape = (p: string) => platform === 'all' || platform.toLowerCase() === p.toLowerCase();
  
  const results = await Promise.allSettled([
    shouldScrape('twitter') ? withTimeout(scrapeTwitterWithFallback(query, limit), 25000) : Promise.resolve([]),
    shouldScrape('reddit') ? withTimeout(scrapeReddit(query, limit), 20000) : Promise.resolve([]),
    shouldScrape('dev.to') ? withTimeout(scrapeDevTo(query, limit), 15000) : Promise.resolve([]),
    shouldScrape('threads') ? withTimeout(scrapeThreads(query, limit), 20000) : Promise.resolve([])
  ]);

  const elapsed = Date.now() - startTime;
  console.log(`⏱️ Scraping completed in ${elapsed}ms`);

  const twitterPosts = results[0].status === 'fulfilled' ? results[0].value : [];
  const redditPosts = results[1].status === 'fulfilled' ? results[1].value : [];
  const devtoPosts = results[2].status === 'fulfilled' ? results[2].value : [];
  const threadsPosts = results[3].status === 'fulfilled' ? results[3].value : [];
  
  // Detailed logging for debugging
  const platformStatus = {
    Twitter: results[0].status === 'fulfilled' ? `✅ ${twitterPosts.length}` : `❌ ${(results[0] as PromiseRejectedResult).reason?.message || 'failed'}`,
    Reddit: results[1].status === 'fulfilled' ? `✅ ${redditPosts.length}` : `❌ ${(results[1] as PromiseRejectedResult).reason?.message || 'failed'}`,
    'Dev.to': results[2].status === 'fulfilled' ? `✅ ${devtoPosts.length}` : `❌ ${(results[2] as PromiseRejectedResult).reason?.message || 'failed'}`,
    Threads: results[3].status === 'fulfilled' ? `✅ ${threadsPosts.length}` : `❌ ${(results[3] as PromiseRejectedResult).reason?.message || 'failed'}`
  };
  
  console.log('📊 Platform Status:', JSON.stringify(platformStatus, null, 2));

  // Konwertuj do unified format
  const unified: UnifiedPost[] = [
    ...convertTwitterPosts(twitterPosts),
    ...convertRedditPosts(redditPosts),
    ...convertDevtoPosts(devtoPosts),
    ...convertThreadsPosts(threadsPosts)
  ];

  // Deduplicate by URL
  const unique = Array.from(
    new Map(unified.map(p => [p.url, p])).values()
  );

  // Sort by score
  const sorted = unique
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  console.log(`✅ Total posts found: ${sorted.length}`);
  return sorted;
}

function convertTwitterPosts(posts: InternalTwitterPost[]): UnifiedPost[] {
  return posts.map(p => ({
    id: p.id,
    platform: 'Twitter' as const,
    title: p.title,
    content: p.content,
    author: p.author,
    likes: p.likes,
    comments: p.replies,
    url: p.url,
    timestamp: p.timestamp,
    image: p.image,
    score: p.score,
    icon: '𝕏'
  }));
}

function convertRedditPosts(posts: RedditPost[]): UnifiedPost[] {
  return posts.map(p => ({
    id: p.id,
    platform: 'Reddit' as const,
    title: p.title,
    content: p.content,
    author: p.author,
    likes: p.likes,
    comments: p.comments,
    url: p.url,
    postUrl: p.postUrl,      // ✅ PRESERVE postUrl
    subreddit: p.subreddit,  // ✅ PRESERVE subreddit
    timestamp: p.timestamp,
    image: p.image,          // ✅ PRESERVE image
    score: p.score,
    icon: '🤖'
  }));
}

function convertDevtoPosts(posts: DevToPost[]): UnifiedPost[] {
  return posts.map(p => ({
    id: p.id,
    platform: 'Dev.to' as const,
    title: p.title,
    content: p.content,
    author: p.author,
    likes: p.likes,
    comments: p.comments,
    url: p.url,
    timestamp: p.timestamp,
    image: p.coverImage,
    score: p.score,
    icon: '👨‍💻'
  }));
}

function convertThreadsPosts(posts: ThreadsPost[]): UnifiedPost[] {
  return posts.map(p => ({
    id: p.id,
    platform: 'Threads' as const,
    title: p.title,
    content: p.content,
    author: p.author,
    username: p.username,
    likes: p.likes,
    comments: p.comments,
    reposts: p.reposts,
    url: p.url,
    timestamp: p.timestamp,
    image: p.image,
    score: p.score,
    icon: '🧵'
  }));
}

/**
 * Compute viral score for a post
 */
export function computeViralScore(post: UnifiedPost): number {
  const engagement = post.likes + post.comments * 2 + (post.reposts || 0) * 3;
  const ageHours = (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60);
  const decay = Math.max(1, Math.pow(ageHours, 0.8));
  return Math.round((engagement / decay) * 100) / 100;
}
