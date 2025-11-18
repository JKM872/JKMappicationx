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

// Alternative Reddit frontends for fallback (10X POWER - more instances!)
const REDDIT_ALTERNATIVES = [
  'https://old.reddit.com',
  'https://www.reddit.com',
  'https://teddit.net',
  'https://libreddit.spike.codes',
  'https://libreddit.kavin.rocks',
  'https://reddit.artemislena.eu',
  'https://lr.riverside.rocks',
  'https://redlib.matthew.science',
  'https://libreddit.dothq.co'
];

// Use proxy for blocked IPs (optional - only if SCRAPER_API_KEY set)
function getProxiedUrl(url: string): string {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (apiKey) {
    return `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`;
  }
  return url;
}

// NEW: Try via Google Cache (bypasses IP blocks) - SKIP (too slow)
async function fetchViaGoogleCache(query: string, limit: number): Promise<RedditPost[]> {
  try {
    const redditUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`;
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(redditUrl)}`;
    console.log(`🔍 Trying Google Cache: ${cacheUrl}`);
    
    const response = await axios.get(cacheUrl, {
      headers: { 'User-Agent': getRandomUserAgent() },
      timeout: 4000,
      validateStatus: (s) => s < 500
    });
    
    if (response.status === 200) {
      // Try to extract JSON from cached page
      const jsonMatch = response.data.match(/window\.__r\s*=\s*({.+?});/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        const posts = parseRedditResponse(data, query);
        if (posts.length > 0) {
          console.log(`✅ Google Cache: Found ${posts.length} posts`);
          return posts.slice(0, limit);
        }
      }
    }
    return [];
  } catch (err) {
    console.warn(`❌ Google Cache failed: ${err instanceof Error ? err.message : 'unknown'}`);
    return [];
  }
}

// NEW: Try via Archive.org Wayback Machine - SKIP (too slow, rarely works)
async function fetchViaArchiveOrg(query: string, limit: number): Promise<RedditPost[]> {
  // Skip - too slow for production
  console.log(`⚡ Skipping Archive.org (too slow)`);
  return [];
}

// NEW: Try via Libreddit/Redlib instances (privacy-focused Reddit frontends) - FAST timeouts!
async function fetchViaLibreddit(query: string, limit: number): Promise<RedditPost[]> {
  const libredditInstances = [
    'https://libreddit.kavin.rocks', // Most reliable first
    'https://reddit.artemislena.eu'
  ];
  
  for (const instance of libredditInstances) {
    try {
      console.log(`📚 Trying Libreddit: ${instance}`);
      const response = await axios.get(`${instance}/search.json?q=${encodeURIComponent(query)}&sort=top&t=week`, {
        headers: { 'User-Agent': getRandomUserAgent() },
        timeout: 3000, // Fast 3s timeout!
        validateStatus: (s) => s < 500
      });
      
      if (response.status === 200 && response.data?.data?.children) {
        const posts = parseRedditResponse(response.data, query);
        if (posts.length > 0) {
          console.log(`✅ Libreddit ${instance}: Found ${posts.length} posts`);
          return posts.slice(0, limit);
        }
      }
    } catch (err) {
      // Skip silently for speed
    }
  }
  return [];
}

// NEW: Try via Redditlist.io API (Reddit aggregator with open API)
async function fetchViaRedditlistAPI(query: string, limit: number): Promise<RedditPost[]> {
  try {
    console.log(`📋 Trying Redditlist.io API...`);
    // Redditlist has a simple JSON endpoint for subreddit search
    const response = await axios.get(`https://api.redditlist.io/api/search?query=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': getRandomUserAgent() },
      timeout: 10000,
      validateStatus: (s) => s < 500
    });
    
    if (response.status === 200 && response.data?.results) {
      const posts: RedditPost[] = response.data.results.slice(0, limit).map((item: any, idx: number) => ({
        id: `redditlist-${item.id || idx}`,
        platform: 'Reddit' as const,
        title: item.title || '',
        content: item.description?.substring(0, 500) || item.title || '',
        author: item.author || 'unknown',
        likes: item.subscribers || 0, // Use subreddit subscribers as proxy for likes
        comments: 0,
        url: item.url || `https://reddit.com/r/${item.name}`,
        timestamp: new Date().toISOString(),
        subreddit: item.name || '',
        score: item.subscribers || 0
      }));
      
      console.log(`✅ Redditlist.io: Found ${posts.length} posts`);
      return posts;
    }
    return [];
  } catch (err) {
    console.warn(`❌ Redditlist.io failed: ${err instanceof Error ? err.message : 'unknown'}`);
    return [];
  }
}

// NEW: Try via RapidAPI Reddit endpoints (multiple providers available)
async function fetchViaRapidAPI(query: string, limit: number): Promise<RedditPost[]> {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    console.warn('⚠️ RAPIDAPI_KEY not set, skipping RapidAPI');
    return [];
  }
  
  try {
    console.log(`⚡ Trying RapidAPI Reddit endpoint...`);
    // Reddit Search API on RapidAPI
    const response = await axios.get(`https://reddit-scraper2.p.rapidapi.com/search_posts`, {
      params: { query: query, sort: 'top', limit: limit },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'reddit-scraper2.p.rapidapi.com',
        'User-Agent': getRandomUserAgent()
      },
      timeout: 5000,
      validateStatus: (s) => s < 500
    });
    
    if (response.status === 200 && response.data?.data) {
      const posts: RedditPost[] = response.data.data.slice(0, limit).map((item: any, idx: number) => ({
        id: `rapidapi-${item.id || idx}`,
        platform: 'Reddit' as const,
        title: item.title || '',
        content: item.selftext?.substring(0, 500) || item.title || '',
        author: item.author || 'unknown',
        likes: item.score || 0,
        comments: item.num_comments || 0,
        url: `https://reddit.com${item.permalink}`,
        timestamp: new Date((item.created_utc || 0) * 1000).toISOString(),
        subreddit: item.subreddit || '',
        score: (item.score || 0) + (item.num_comments || 0) * 2
      }));
      
      console.log(`✅ RapidAPI: Found ${posts.length} posts`);
      return posts;
    }
    return [];
  } catch (err) {
    console.warn(`❌ RapidAPI failed: ${err instanceof Error ? err.message : 'unknown'}`);
    return [];
  }
}

// NEW: Try via Pullpush.io (Pushshift successor with better reliability)
async function fetchViaPullpush(query: string, limit: number): Promise<RedditPost[]> {
  try {
    console.log(`🔄 Trying Pullpush.io (Pushshift v2)...`);
    const url = `https://api.pullpush.io/reddit/search/submission/?q=${encodeURIComponent(query)}&size=${Math.min(limit, 100)}&sort=desc&sort_type=score`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': getRandomUserAgent() },
      timeout: 5000,
      validateStatus: (s) => s < 500
    });
    
    if (response.status === 200 && response.data?.data) {
      const posts: RedditPost[] = response.data.data.slice(0, limit).map((item: any, idx: number) => ({
        id: `pullpush-${item.id || idx}`,
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
      
      console.log(`✅ Pullpush.io: Found ${posts.length} posts`);
      return posts;
    }
    return [];
  } catch (err) {
    console.warn(`❌ Pullpush.io failed: ${err instanceof Error ? err.message : 'unknown'}`);
    return [];
  }
}

export async function scrapeReddit(query: string, limit: number = 20): Promise<RedditPost[]> {
  try {
    console.log(`🤖 Scraping Reddit for: "${query}" [10X POWER MODE]`);

    // ⚡ 10X POWER STRATEGY 1: Try Libreddit instances first (privacy frontends, less likely blocked)
    console.log('⚡ Strategy 1: Libreddit/Redlib instances...');
    const libredditPosts = await fetchViaLibreddit(query, limit);
    if (libredditPosts.length > 0) return libredditPosts;

    // ⚡ 10X POWER STRATEGY 2: Try Google Cache (bypasses IP blocks)
    console.log('⚡ Strategy 2: Google Cache proxy...');
    const cachePosts = await fetchViaGoogleCache(query, limit);
    if (cachePosts.length > 0) return cachePosts;

    // ⚡ 10X POWER STRATEGY 3: Try Archive.org Wayback Machine
    console.log('⚡ Strategy 3: Archive.org Wayback...');
    const archivePosts = await fetchViaArchiveOrg(query, limit);
    if (archivePosts.length > 0) return archivePosts;

    // ⚡ 10X POWER STRATEGY 4: Try Pullpush.io (Pushshift v2 - more reliable!)
    console.log('⚡ Strategy 4: Pullpush.io API...');
    const pullpushPosts = await fetchViaPullpush(query, limit);
    if (pullpushPosts.length > 0) return pullpushPosts;

    // ⚡ 10X POWER STRATEGY 5: Try RapidAPI (if API key available)
    console.log('⚡ Strategy 5: RapidAPI Reddit endpoint...');
    const rapidPosts = await fetchViaRapidAPI(query, limit);
    if (rapidPosts.length > 0) return rapidPosts;

    // ⚡ 10X POWER STRATEGY 6: Try Redditlist.io aggregator
    console.log('⚡ Strategy 6: Redditlist.io API...');
    const redditlistPosts = await fetchViaRedditlistAPI(query, limit);
    if (redditlistPosts.length > 0) return redditlistPosts;

    // Strategy 7: Try multiple Reddit JSON endpoints (with optional proxy)
    console.log('⚡ Strategy 7: Reddit frontends (old/www/teddit)...');
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

    // Strategy 6: Try via simple proxy (reddit.com/.json endpoint with different UA)
    console.warn('⚠️ Strategy 6: Direct .json with curl headers...');
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
    
    // Strategy 8: RSS fallback
    console.warn('⚠️ Strategy 8: RSS fallback...');
    const rssPosts = await fetchRedditRssFallback(query, limit);
    if (rssPosts.length > 0) return rssPosts;
    
    // Strategy 9: Original Pushshift API (last resort)
    console.warn('⚠️ Strategy 9: Original Pushshift API (final fallback)...');
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
