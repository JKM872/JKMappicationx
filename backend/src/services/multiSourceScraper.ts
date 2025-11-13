import axios from 'axios';
import { request } from 'undici';
import * as cheerio from 'cheerio';

export interface ViralPost {
  id: string;
  platform: 'reddit' | 'devto' | 'hackernews' | 'rss';
  author: string;
  title: string;
  content: string;
  url: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  score?: number;
}

/**
 * Scrape Reddit for viral posts
 */
export async function scrapeReddit(query: string, limit: number = 20): Promise<ViralPost[]> {
  try {
    console.log(`🔍 Scraping Reddit for: ${query}`);
    
    const { body } = await request(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=top&t=week&limit=${limit}`,
      {
        headers: {
          'User-Agent': 'Viral-Content-Hunter/1.0'
        }
      }
    );

    const data = await body.json() as any;
    
    if (!data.data?.children) {
      return [];
    }

    return data.data.children
      .filter((item: any) => item.data.score > 50)
      .map((item: any) => {
        const post = item.data;
        return {
          id: `reddit_${post.id}`,
          platform: 'reddit' as const,
          author: post.author || 'Unknown',
          title: post.title || '',
          content: post.selftext || post.title || '',
          url: `https://reddit.com${post.permalink}`,
          likes: post.ups || 0,
          comments: post.num_comments || 0,
          shares: 0,
          timestamp: new Date(post.created_utc * 1000)
        };
      });
  } catch (err) {
    console.error('Reddit scraping error:', err);
    return [];
  }
}

/**
 * Scrape Dev.to for viral posts
 */
export async function scrapeDevTo(query: string, limit: number = 20): Promise<ViralPost[]> {
  try {
    console.log(`🔍 Scraping Dev.to for: ${query}`);
    
    const { data } = await axios.get('https://dev.to/api/articles', {
      params: {
        tag: query.toLowerCase().replace(/\s+/g, ''),
        per_page: Math.min(limit, 30),
        top: 7
      },
      timeout: 10000
    });

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((article: any) => ({
      id: `devto_${article.id}`,
      platform: 'devto' as const,
      author: article.user?.name || 'Unknown',
      title: article.title || '',
      content: article.description || '',
      url: article.url || '',
      likes: article.positive_reactions_count || 0,
      comments: article.comments_count || 0,
      shares: 0,
      timestamp: new Date(article.published_at)
    }));
  } catch (err) {
    console.error('Dev.to scraping error:', err);
    return [];
  }
}

/**
 * Scrape Hacker News for viral posts
 */
export async function scrapeHackerNews(limit: number = 20): Promise<ViralPost[]> {
  try {
    console.log(`🔍 Scraping Hacker News`);
    
    const { data: topStories } = await axios.get(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
      { timeout: 10000 }
    );

    if (!Array.isArray(topStories)) {
      return [];
    }

    const posts: ViralPost[] = [];
    
    for (let i = 0; i < Math.min(limit, 30, topStories.length); i++) {
      try {
        const { data: item } = await axios.get(
          `https://hacker-news.firebaseio.com/v0/item/${topStories[i]}.json`,
          { timeout: 5000 }
        );

        if (item && item.type === 'story') {
          posts.push({
            id: `hn_${item.id}`,
            platform: 'hackernews' as const,
            author: item.by || 'Anonymous',
            title: item.title || '',
            content: item.title || '',
            url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
            likes: item.score || 0,
            comments: item.descendants || 0,
            shares: 0,
            timestamp: new Date(item.time * 1000)
          });
        }
      } catch (itemErr) {
        console.error(`Error fetching HN item ${topStories[i]}:`, itemErr);
      }
    }

    return posts;
  } catch (err) {
    console.error('Hacker News scraping error:', err);
    return [];
  }
}

/**
 * Scrape RSS feeds for viral posts
 */
export async function scrapeRSSFeeds(query: string, limit: number = 20): Promise<ViralPost[]> {
  const RSS_FEEDS = [
    'https://hnrss.org/frontpage',
    'https://www.reddit.com/r/programming/.rss',
  ];

  try {
    console.log(`🔍 Scraping RSS Feeds for: ${query}`);
    
    const allPosts: ViralPost[] = [];
    const lowerQuery = query.toLowerCase();

    for (const feedUrl of RSS_FEEDS) {
      try {
        const { body } = await request(feedUrl, {
          headers: { 'User-Agent': 'Viral-Content-Hunter/1.0' },
          bodyTimeout: 10000,
          headersTimeout: 10000
        });
        
        const xml = await body.text();
        const $ = cheerio.load(xml, { xmlMode: true });
        
        $('item, entry').each((idx, elem) => {
          if (allPosts.length >= limit) return false;
          
          const title = $(elem).find('title').text();
          const description = $(elem).find('description, summary, content').text();
          const link = $(elem).find('link').attr('href') || $(elem).find('link').text();
          const pubDate = $(elem).find('pubDate, published, updated').text();

          if (title.toLowerCase().includes(lowerQuery) || description.toLowerCase().includes(lowerQuery)) {
            allPosts.push({
              id: `rss_${Date.now()}_${idx}`,
              platform: 'rss' as const,
              author: 'RSS Feed',
              title: title || 'No title',
              content: description.substring(0, 500) || title,
              url: link || '',
              likes: 0,
              comments: 0,
              shares: 0,
              timestamp: pubDate ? new Date(pubDate) : new Date()
            });
          }
        });
      } catch (err) {
        console.error(`Error scraping ${feedUrl}:`, err);
      }
    }

    return allPosts.slice(0, limit);
  } catch (err) {
    console.error('RSS scraping error:', err);
    return [];
  }
}

/**
 * Search all sources and combine results
 */
export async function searchAllSources(query: string, limit: number = 20): Promise<ViralPost[]> {
  console.log(`\n🚀 Starting multi-source search for: "${query}"\n`);

  const results = await Promise.allSettled([
    scrapeReddit(query, limit),
    scrapeDevTo(query, limit),
    scrapeHackerNews(limit),
    scrapeRSSFeeds(query, limit)
  ]);

  const allPosts: ViralPost[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allPosts.push(...result.value);
    } else {
      const sources = ['Reddit', 'Dev.to', 'Hacker News', 'RSS'];
      console.error(`${sources[index]} failed:`, result.reason);
    }
  });

  // Deduplicate by ID
  const uniquePosts = Array.from(
    new Map(allPosts.map(p => [p.id, p])).values()
  );

  // Sort by engagement score
  return uniquePosts
    .sort((a, b) => {
      const scoreA = a.likes + a.comments * 2;
      const scoreB = b.likes + b.comments * 2;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/**
 * Compute viral score for a post
 */
export function computeViralScore(post: ViralPost): number {
  const engagement = post.likes + post.comments * 2 + post.shares * 3;
  const ageHours = (Date.now() - post.timestamp.getTime()) / (1000 * 60 * 60);
  const hoursFactor = Math.pow(ageHours + 1, 0.8);
  
  return engagement / hoursFactor;
}
