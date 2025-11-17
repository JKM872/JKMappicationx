import axios from 'axios';

export interface RedditPost {
  id: string;
  platform: 'Reddit';
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: number;
  url: string;
  timestamp: string;
  subreddit: string;
  score: number;
}

// Multiple User-Agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Alternative Reddit frontends for fallback
const REDDIT_ALTERNATIVES = [
  'https://old.reddit.com',
  'https://www.reddit.com',
  'https://teddit.net'
];

// Use proxy for blocked IPs (optional - only if SCRAPER_API_KEY set)
function getProxiedUrl(url: string): string {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (apiKey) {
    return `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`;
  }
  return url;
}

export async function scrapeReddit(query: string, limit: number = 20): Promise<RedditPost[]> {
  try {
    console.log(`🤖 Scraping Reddit for: "${query}"`);

    // Strategy 1: Try multiple Reddit JSON endpoints (with optional proxy)
    for (const baseUrl of REDDIT_ALTERNATIVES) {
      try {
        let url = `${baseUrl}/search.json?q=${encodeURIComponent(query)}&sort=top&t=week&limit=${Math.min(limit, 100)}`;
        url = getProxiedUrl(url);
    
        const response = await axios.get(url, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'application/json, text/html, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': baseUrl,
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
          },
          timeout: 10000,
          validateStatus: (status) => status < 500
        });
    
        if (response.status === 200 && response.data?.data?.children) {
          const posts = parseRedditResponse(response.data, query);
          if (posts.length > 0) {
            console.log(`✅ Reddit via ${baseUrl}: ${posts.length} posts`);
            return posts;
          }
        }
        
        console.warn(`⚠️ ${baseUrl} returned ${response.status}, trying next...`);
      } catch (err) {
        console.warn(`❌ ${baseUrl} failed: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    // Strategy 2: Try via simple proxy (reddit.com/.json endpoint with different UA)
    console.warn('⚠️ All frontend endpoints failed, trying direct .json with aggressive headers');
    try {
      const directUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${Math.min(limit, 100)}&sort=top&t=week`;
      const directResponse = await axios.get(directUrl, {
        headers: {
          'User-Agent': 'curl/7.68.0',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        },
        timeout: 10000,
        validateStatus: (s) => s < 500
      });
      
      if (directResponse.status === 200 && directResponse.data?.data?.children) {
        const posts = parseRedditResponse(directResponse.data, query);
        if (posts.length > 0) {
          console.log(`✅ Reddit via direct JSON: ${posts.length} posts`);
          return posts;
        }
      }
    } catch (err) {
      console.warn(`❌ Direct JSON failed: ${err instanceof Error ? err.message : 'unknown'}`);
    }
    
    // Strategy 3: RSS fallback
    console.warn('⚠️ Direct JSON failed, trying RSS fallback');
    const rssPosts = await fetchRedditRssFallback(query, limit);
    if (rssPosts.length > 0) return rssPosts;
    
    // Strategy 4: Pushshift API (historical data)
    console.warn('⚠️ RSS failed, trying Pushshift API');
    return await fetchPushshiftFallback(query, limit);
  } catch (err) {
    console.error('❌ Reddit error:', err instanceof Error ? err.message : err);
    return [];
  }
}

function parseRedditResponse(data: any, query: string): RedditPost[] {
  try {

    if (!data?.data?.children) {
      console.warn('⚠️ Reddit: No data in response');
      return [];
    }

    const posts = data.data.children
      .filter((item: any) => item.data && item.data.score > 30) // Lowered threshold
      .map((item: any) => {
        const post = item.data;
        return {
          id: `reddit-${post.id}`,
          platform: 'Reddit' as const,
          title: post.title,
          content: post.selftext?.substring(0, 500) || post.title,
          author: post.author,
          likes: post.ups,
          comments: post.num_comments,
          url: `https://reddit.com${post.permalink}`,
          timestamp: new Date(post.created_utc * 1000).toISOString(),
          subreddit: post.subreddit,
          score: post.ups + post.num_comments * 2
        };
      });

    console.log(`✅ Reddit: Found ${posts.length} posts`);
    return posts;
  } catch (err) {
    console.error('❌ Reddit parsing error:', err instanceof Error ? err.message : err);
    return [];
  }
}

// Pushshift API fallback (historical Reddit data)
async function fetchPushshiftFallback(query: string, limit: number): Promise<RedditPost[]> {
  try {
    const url = `https://api.pushshift.io/reddit/search/submission/?q=${encodeURIComponent(query)}&size=${Math.min(limit, 100)}&sort=desc&sort_type=score`;
    console.log(`🔁 Pushshift API: ${url}`);
    const res = await axios.get(url, {
      headers: { 'User-Agent': getRandomUserAgent() },
      timeout: 10000,
      validateStatus: (s) => s < 500
    });

    if (!res.data?.data) return [];

    const posts: RedditPost[] = res.data.data.slice(0, limit).map((item: any, idx: number) => ({
      id: `pushshift-${item.id || idx}`,
      platform: 'Reddit' as const,
      title: item.title || '',
      content: item.selftext?.substring(0, 500) || item.title || '',
      author: item.author || 'unknown',
      likes: item.score || 0,
      comments: item.num_comments || 0,
      url: item.full_link || `https://reddit.com${item.permalink || ''}`,
      timestamp: new Date((item.created_utc || 0) * 1000).toISOString(),
      subreddit: item.subreddit || '',
      score: (item.score || 0) + (item.num_comments || 0) * 2
    }));

    console.log(`✅ Pushshift: Found ${posts.length} posts`);
    return posts;
  } catch (err) {
    console.error(`❌ Pushshift error: ${err instanceof Error ? err.message : 'unknown'}`);
    return [];
  }
}

// RSS fallback using Reddit's RSS search (if JSON endpoints blocked)
async function fetchRedditRssFallback(query: string, limit: number): Promise<RedditPost[]> {
  try {
    const rssUrl = `https://www.reddit.com/search.rss?q=${encodeURIComponent(query)}&limit=${Math.min(limit, 100)}`;
    console.log(`🔁 Reddit RSS fallback: ${rssUrl}`);
    const res = await axios.get(rssUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
      },
      timeout: 12000,
      validateStatus: (s) => s < 500
    });

    if (!res.data) return [];

    // Simple XML parse via regex for titles/links (lightweight)
    const items = Array.from(res.data.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<author>([\s\S]*?)<\/author>/g));
    const posts: RedditPost[] = items.slice(0, limit).map((m: any, idx: number) => ({
      id: `rss-${Date.now()}-${idx}`,
      platform: 'Reddit',
      title: (m[1] || '').replace(/<[^>]+>/g, ''),
      content: '',
      author: (m[4] || '').replace(/<[^>]+>/g, ''),
      likes: 0,
      comments: 0,
      url: (m[2] || '').trim(),
      timestamp: new Date(m[3] || Date.now()).toISOString(),
      subreddit: '',
      score: 0
    }));

    console.log(`✅ Reddit RSS fallback: Found ${posts.length} posts`);
    return posts;
  } catch (err) {
    console.error('❌ Reddit RSS fallback error:', err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getRedditTrending(): Promise<string[]> {
  try {
    const response = await axios.get('https://www.reddit.com/r/popular.json?limit=10', {
      headers: {
        'User-Agent': 'Viral-Content-Hunter/1.0'
      },
      timeout: 8000
    });

    return response.data.data.children
      .map((item: any) => item.data.title)
      .slice(0, 10);
  } catch (err) {
    console.error('❌ Reddit trending error:', err);
    return [];
  }
}
