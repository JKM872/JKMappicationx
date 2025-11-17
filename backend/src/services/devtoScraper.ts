import axios from 'axios';

export interface DevToPost {
  id: string;
  platform: 'Dev.to';
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: number;
  url: string;
  timestamp: string;
  tags: string[];
  score: number;
  coverImage?: string;
}

export async function scrapeDevTo(query: string, limit: number = 20): Promise<DevToPost[]> {
  try {
    console.log(`👨‍💻 Scraping Dev.to for: "${query}"`);

    const tag = query.toLowerCase().split(' ')[0];
    
    const response = await axios.get('https://dev.to/api/articles', {
      params: {
        tag: tag,
        per_page: Math.min(limit, 30),
        state: 'fresh'
      },
      timeout: 10000
    });

    if (!Array.isArray(response.data)) {
      console.warn('⚠️ Dev.to: Invalid response');
      return [];
    }

    const posts = response.data.map((article: any) => ({
      id: `devto-${article.id}`,
      platform: 'Dev.to' as const,
      title: article.title,
      content: article.description || article.title,
      author: article.user?.name || 'Unknown',
      likes: article.positive_reactions_count || 0,
      comments: article.comments_count || 0,
      url: article.url,
      timestamp: article.published_at,
      tags: article.tag_list || [],
      score: (article.positive_reactions_count || 0) + (article.comments_count || 0) * 2,
      coverImage: article.cover_image
    }));

    console.log(`✅ Dev.to: Found ${posts.length} posts`);
    return posts;
  } catch (err) {
    console.error('❌ Dev.to error:', err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getDevToTrending(): Promise<string[]> {
  try {
    const response = await axios.get('https://dev.to/api/articles?top=7', {
      timeout: 8000
    });

    return response.data
      .slice(0, 10)
      .map((article: any) => article.title);
  } catch (err) {
    console.error('❌ Dev.to trending error:', err);
    return [];
  }
}
