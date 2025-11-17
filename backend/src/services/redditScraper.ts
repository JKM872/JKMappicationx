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

export async function scrapeReddit(query: string, limit: number = 20): Promise<RedditPost[]> {
  try {
    console.log(`🤖 Scraping Reddit for: "${query}"`);

    const response = await axios.get(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=top&t=week&limit=${Math.min(limit, 100)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      }
    );

    if (!response.data?.data?.children) {
      console.warn('⚠️ Reddit: No data returned');
      return [];
    }

    const posts = response.data.data.children
      .filter((item: any) => item.data.score > 50)
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
    console.error('❌ Reddit error:', err instanceof Error ? err.message : err);
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
