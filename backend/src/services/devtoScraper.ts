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

/**
 * Scrape Dev.to articles using multiple search strategies
 */
export async function scrapeDevTo(query: string, limit: number = 20): Promise<DevToPost[]> {
  try {
    console.log(`👨‍💻 Scraping Dev.to for: "${query}"`);

    // Strategy 1: Try full-text search endpoint first
    let posts = await searchDevToArticles(query, limit);
    
    if (posts.length > 0) {
      console.log(`✅ Dev.to (search): Found ${posts.length} posts`);
      return posts;
    }

    // Strategy 2: Fallback to tag-based search
    console.log('⚠️ Dev.to: Search returned no results, trying tag-based search...');
    posts = await searchDevToByTag(query, limit);
    
    if (posts.length > 0) {
      console.log(`✅ Dev.to (tag): Found ${posts.length} posts`);
      return posts;
    }

    // Strategy 3: Get latest articles and filter client-side
    console.log('⚠️ Dev.to: Tag search failed, trying latest articles...');
    posts = await getLatestDevToArticles(query, limit);
    
    console.log(`✅ Dev.to (latest): Found ${posts.length} posts`);
    return posts;
  } catch (err) {
    console.error('❌ Dev.to error:', err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Search Dev.to using the public articles API with query parameter
 */
async function searchDevToArticles(query: string, limit: number): Promise<DevToPost[]> {
  try {
    // Dev.to has multiple search approaches - try the Forem search API first
    // This is the most reliable method as of 2024
    const searchUrls = [
      // Method 1: Direct articles endpoint with per_page
      `https://dev.to/api/articles?per_page=${Math.min(limit, 30)}&top=7`,
      // Method 2: Search via Forem API  
      `https://dev.to/search/feed_content?per_page=${Math.min(limit, 30)}&search_fields=${encodeURIComponent(query)}&class_name=Article&sort_by=hotness_score&sort_direction=desc`,
    ];

    for (const url of searchUrls) {
      try {
        console.log(`🔍 Dev.to: Trying ${url.substring(0, 60)}...`);
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'api-key': process.env.DEVTO_API_KEY || ''
          },
          timeout: 8000,
          validateStatus: (s) => s < 500
        });

        if (response.status === 200) {
          let articles: any[] = [];
          
          // Handle different response formats
          if (Array.isArray(response.data)) {
            articles = response.data;
          } else if (response.data?.result && Array.isArray(response.data.result)) {
            articles = response.data.result;
          }
          
          if (articles.length > 0) {
            // Filter by query if we got generic results
            const queryLower = query.toLowerCase();
            const filtered = articles.filter((article: any) => {
              const title = (article.title || '').toLowerCase();
              const description = (article.description || '').toLowerCase();
              const tags = Array.isArray(article.tag_list) ? article.tag_list.join(' ').toLowerCase() : '';
              const combined = `${title} ${description} ${tags}`;
              return queryLower.split(/\s+/).some(word => combined.includes(word));
            });
            
            const results = (filtered.length > 0 ? filtered : articles).slice(0, limit);
            console.log(`✅ Dev.to search: Found ${results.length} articles`);
            return results.map((article: any) => mapDevToArticle(article));
          }
        }
      } catch (innerErr) {
        console.warn(`⚠️ Dev.to endpoint failed: ${innerErr instanceof Error ? innerErr.message : innerErr}`);
      }
    }
    
    return [];
  } catch (err) {
    console.warn('⚠️ Dev.to search API failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Search Dev.to by tag (relaxed filtering)
 */
async function searchDevToByTag(query: string, limit: number): Promise<DevToPost[]> {
  try {
    // Extract potential tags from query (first word, lowercase, no special chars)
    const tags = query.toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^a-z0-9]/g, ''))
      .filter(word => word.length > 1)
      .slice(0, 3);

    const allPosts: DevToPost[] = [];

    // Try each potential tag
    for (const tag of tags) {
      try {
        const response = await axios.get('https://dev.to/api/articles', {
          params: {
            tag: tag,
            per_page: Math.min(limit, 30),
            state: 'fresh'
          },
          timeout: 8000
        });

        if (Array.isArray(response.data)) {
          const posts = response.data.map((article: any) => mapDevToArticle(article));
          allPosts.push(...posts);
        }
      } catch {
        // Continue to next tag
      }
    }

    // Deduplicate by ID
    const uniquePosts = Array.from(
      new Map(allPosts.map(p => [p.id, p])).values()
    );

    return uniquePosts.slice(0, limit);
  } catch (err) {
    console.warn('⚠️ Dev.to tag search failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Get latest Dev.to articles and filter by query
 */
async function getLatestDevToArticles(query: string, limit: number): Promise<DevToPost[]> {
  try {
    const response = await axios.get('https://dev.to/api/articles', {
      params: {
        per_page: 100,
        state: 'rising'
      },
      timeout: 10000
    });

    if (!Array.isArray(response.data)) {
      return [];
    }

    const queryWords = query.toLowerCase().split(/\s+/);
    
    // Filter articles that contain query words in title, description, or tags
    const filtered = response.data.filter((article: any) => {
      const title = (article.title || '').toLowerCase();
      const description = (article.description || '').toLowerCase();
      const tags = (article.tag_list || []).join(' ').toLowerCase();
      const combined = `${title} ${description} ${tags}`;
      
      return queryWords.some(word => combined.includes(word));
    });

    return filtered.slice(0, limit).map((article: any) => mapDevToArticle(article));
  } catch (err) {
    console.warn('⚠️ Dev.to latest articles failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Map Dev.to API response to DevToPost interface
 */
function mapDevToArticle(article: any): DevToPost {
  return {
    id: `devto-${article.id}`,
    platform: 'Dev.to' as const,
    title: article.title || article.class_name || 'Untitled',
    content: article.description || article.body_text?.substring(0, 500) || article.title || '',
    author: article.user?.name || article.user?.username || 'Unknown',
    likes: article.positive_reactions_count || article.public_reactions_count || 0,
    comments: article.comments_count || 0,
    url: article.url || article.path ? `https://dev.to${article.path}` : '',
    timestamp: article.published_at || article.created_at || new Date().toISOString(),
    tags: article.tag_list || article.tags?.split(',').map((t: string) => t.trim()) || [],
    score: (article.positive_reactions_count || 0) + (article.comments_count || 0) * 2,
    coverImage: article.cover_image || article.main_image
  };
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
