import axios from 'axios';
import * as cheerio from 'cheerio';

// Lista publicznych instancji Nitter (failover) - updated 11/2025
// Używamy tylko tych które działają + dodajemy alternatywy
const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net', 
  'https://nitter.net',
  'https://nitter.unixfox.eu',
  'https://nitter.moomoo.me',
  'https://twitter.076.ne.jp',
  'https://nitter.ir'
];

// Twitter RSS jako backup (publiczne trendy bez scrapowania)
const TWITTER_RSS_FEEDS = [
  'https://nitter.net/search/rss?q=%23trending',
  'https://nitter.poast.org/search/rss?q=%23viral'
];

let currentInstanceIndex = 0;

export interface TwitterPost {
  id: string;
  platform: 'Twitter';
  author: string;
  handle: string;
  title: string;
  content: string;
  url: string;
  likes: number;
  retweets: number;
  replies: number;
  timestamp: string;
  image?: string;
  score: number;
}

/**
 * Przełącz na następną instancję Nitter
 */
function getNextInstance(): string {
  const instance = NITTER_INSTANCES[currentInstanceIndex];
  currentInstanceIndex = (currentInstanceIndex + 1) % NITTER_INSTANCES.length;
  return instance;
}

/**
 * Spróbuj scrapować z daną instancją Nitter
 */
async function tryInstance(instance: string, query: string): Promise<TwitterPost[]> {
  try {
    console.log(`🔗 Trying Nitter: ${instance}`);

    const response = await axios.get(
      `${instance}/search?q=${encodeURIComponent(query)}&f=top`,
      {
        validateStatus: (status) => status < 500, // Accept 4xx but retry 5xx
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 12000,
        maxRedirects: 5
      }
    );
    
    // Skip rate limits and access denied
    if (response.status === 403 || response.status === 429 || response.status === 503) {
      console.warn(`⚠️ Nitter ${instance}: ${response.status} - trying next`);
      return [];
    }

    const $ = cheerio.load(response.data);
    const posts: TwitterPost[] = [];

    // Nitter HTML structure parsing
    $('.timeline-item').each((idx, elem) => {
      try {
        const $elem = $(elem);

        const author = $elem.find('.fullname').text()?.trim() || 'Unknown';
        const handle = $elem.find('.username').text()?.trim() || '@unknown';
        const content = $elem.find('.tweet-content').text()?.trim() || '';
        const link = $elem.find('.tweet-link')?.attr('href') || '';
        
        // Extract stats
        const statsText = $elem.find('.tweet-stats').text();
        const likes = parseInt(statsText?.match(/(\d+)\s*(?:likes?|❤️)/i)?.[1] || '0');
        const retweets = parseInt(statsText?.match(/(\d+)\s*(?:retweets?|🔁)/i)?.[1] || '0');
        const replies = parseInt(statsText?.match(/(\d+)\s*(?:replies?|💬)/i)?.[1] || '0');

        const timeText = $elem.find('.tweet-date a')?.attr('title') || '';
        const image = $elem.find('.attachment.image img')?.attr('src');

        if (!content || content.length < 10) return;

        const post: TwitterPost = {
          id: `twitter-${Date.now()}-${idx}`,
          platform: 'Twitter',
          author: author,
          handle: handle,
          title: content.substring(0, 100),
          content: content,
          url: link ? `https://twitter.com${link.replace('/i/web', '')}` : '',
          likes: likes,
          retweets: retweets,
          replies: replies,
          timestamp: timeText || new Date().toISOString(),
          image: image,
          score: likes + retweets * 1.5 + replies * 0.5
        };

        posts.push(post);
      } catch (err) {
        console.error('Error parsing tweet:', err instanceof Error ? err.message : err);
      }
    });

    if (posts.length > 0) {
      console.log(`✅ Nitter: Found ${posts.length} posts`);
      return posts;
    }

    return [];
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Nitter ${instance} failed: ${errorMsg}`);
    return [];
  }
}

/**
 * Główna funkcja - scrapuj Nitter z failover
 */
export async function scrapeNitter(query: string, limit: number = 20): Promise<TwitterPost[]> {
  console.log(`\n🐦 Scraping Nitter for: "${query}"\n`);

  // Spróbuj każdą instancję
  for (let i = 0; i < NITTER_INSTANCES.length; i++) {
    const instance = getNextInstance();
    const posts = await tryInstance(instance, query);

    if (posts.length > 0) {
      return posts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    // Małe opóźnienie przed następną próbą
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.warn('⚠️ All Nitter instances failed - returning empty');
  return [];
}

/**
 * Scrapuj trending topics (if available)
 */
export async function getNitterTrending(): Promise<string[]> {
  try {
    const instance = NITTER_INSTANCES[0];
    const response = await axios.get(`${instance}/`, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const trending: string[] = [];

    $('.trending-item').each((idx, elem) => {
      const text = $(elem).text()?.trim();
      if (text && trending.length < 10) {
        trending.push(text);
      }
    });

    return trending;
  } catch (err) {
    console.error('❌ Trending error:', err instanceof Error ? err.message : err);
    return [];
  }
}
