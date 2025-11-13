import { request } from 'undici';
import * as cheerio from 'cheerio';
import { Post, PostWithScore } from '../types';

const USER_AGENT = process.env.SCRAPER_USER_AGENT || 
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const SCRAPER_DELAY = parseInt(process.env.SCRAPER_DELAY_MS || '1000');

// List of public Nitter instances (as of 2025)
const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
];

/**
 * Fetch viral posts from Nitter (Twitter frontend)
 * @param query Search query (keyword, hashtag, etc.)
 * @param limit Maximum number of posts to return
 * @returns Array of posts with engagement metrics
 */
export async function fetchNitterSearch(query: string, limit: number = 30): Promise<Post[]> {
  const posts: Post[] = [];
  
  // Try multiple Nitter instances in case one is down
  for (const instance of NITTER_INSTANCES) {
    try {
      const url = `${instance}/search?f=tweets&q=${encodeURIComponent(query)}`;
      
      console.log(`🔍 Scraping: ${url}`);
      
      const { body } = await request(url, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'DNT': '1',
        },
      });

      const html = await body.text();
      const $ = cheerio.load(html);

      // Parse tweets from Nitter HTML structure
      $('.timeline-item').each((i, el) => {
        if (posts.length >= limit) return false;

        const $el = $(el);
        
        // Extract content
        const content = $el.find('.tweet-content').text().trim();
        if (!content) return;

        // Extract author
        const author = $el.find('.username').text().trim().replace('@', '');
        
        // Extract stats (Nitter displays stats as text)
        const statsContainer = $el.find('.tweet-stats');
        
        const likesText = statsContainer.find('.icon-heart').parent().text().trim() || '0';
        const retweetsText = statsContainer.find('.icon-retweet').parent().text().trim() || '0';
        const repliesText = statsContainer.find('.icon-comment').parent().text().trim() || '0';

        // Parse numbers (handle 'K', 'M' suffixes)
        const likes = parseStatNumber(likesText);
        const retweets = parseStatNumber(retweetsText);
        const replies = parseStatNumber(repliesText);

        // Extract timestamp
        const timeText = $el.find('.tweet-date').attr('title') || $el.find('.tweet-date').text();
        const hoursAgo = parseTimeAgo(timeText);

        // Extract post URL
        const postUrl = instance + $el.find('.tweet-link').attr('href');

        posts.push({
          content,
          author,
          likes,
          retweets,
          replies,
          hoursAgo,
          postUrl,
        });
      });

      // If we got posts, break the loop (instance is working)
      if (posts.length > 0) {
        console.log(`✅ Successfully scraped ${posts.length} posts from ${instance}`);
        break;
      }

    } catch (error) {
      console.warn(`⚠️ Failed to scrape ${instance}:`, (error as Error).message);
      continue; // Try next instance
    }
  }

  if (posts.length === 0) {
    throw new Error('Failed to scrape posts from all Nitter instances');
  }

  // Add delay to avoid rate limiting
  await sleep(SCRAPER_DELAY);

  return posts;
}

/**
 * Compute viral score for a post
 * Formula: (likes*1 + retweets*1.5 + replies*2) / (hoursAgo^0.8)
 */
export function computeViralScore(post: Post): number {
  const { likes, retweets, replies, hoursAgo } = post;
  
  // Raw engagement score (weighted by importance)
  const rawScore = (likes * 1) + (retweets * 1.5) + (replies * 2);
  
  // Time normalization (favor recent posts)
  const timeNormalization = Math.pow(Math.max(1, hoursAgo), 0.8);
  
  // Final score
  const score = rawScore / timeNormalization;
  
  return parseFloat(score.toFixed(2));
}

/**
 * Parse stat numbers with K/M suffixes
 * Examples: "1.2K" -> 1200, "5M" -> 5000000, "42" -> 42
 */
function parseStatNumber(text: string): number {
  const cleaned = text.replace(/[^\d.KMkm]/g, '');
  
  if (cleaned.includes('K') || cleaned.includes('k')) {
    return Math.round(parseFloat(cleaned) * 1000);
  }
  
  if (cleaned.includes('M') || cleaned.includes('m')) {
    return Math.round(parseFloat(cleaned) * 1000000);
  }
  
  return parseInt(cleaned) || 0;
}

/**
 * Parse time ago text to hours
 * Examples: "2h" -> 2, "1d" -> 24, "3m" -> 0.05
 */
function parseTimeAgo(text: string): number {
  const cleaned = text.toLowerCase().trim();
  
  // Match patterns like "2h", "1d", "30m"
  const match = cleaned.match(/(\d+)\s*([smhd])/);
  
  if (!match) {
    // If can't parse, assume recent (1 hour)
    return 1;
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value / 3600; // seconds to hours
    case 'm': return value / 60;   // minutes to hours
    case 'h': return value;        // hours
    case 'd': return value * 24;   // days to hours
    default: return 1;
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Rank posts by viral score
 */
export function rankPostsByScore(posts: Post[]): PostWithScore[] {
  return posts
    .map(post => ({
      ...post,
      score: computeViralScore(post),
    }))
    .sort((a, b) => b.score - a.score);
}
