import { scrapeNitter, TwitterPost } from './nitterScraper';
import { scrapeReddit, RedditPost } from './redditScraper';
import { scrapeDevTo, DevToPost } from './devtoScraper';

export interface UnifiedPost {
  id: string;
  platform: 'Twitter' | 'Reddit' | 'Dev.to';
  title: string;
  content: string;
  author: string;
  likes: number;
  comments: number;
  url: string;
  timestamp: string;
  image?: string;
  score: number;
  icon: string;
}

/**
 * Scrapuj ze wszystkich źródeł równocześnie
 */
export async function searchAllSources(
  query: string,
  limit: number = 20
): Promise<UnifiedPost[]> {
  console.log(`\n🚀 Multi-platform search: "${query}"\n`);

  const results = await Promise.allSettled([
    scrapeNitter(query, limit),
    scrapeReddit(query, limit),
    scrapeDevTo(query, limit)
  ]);

  const twitterPosts = results[0].status === 'fulfilled' ? results[0].value : [];
  const redditPosts = results[1].status === 'fulfilled' ? results[1].value : [];
  const devtoPosts = results[2].status === 'fulfilled' ? results[2].value : [];

  console.log(`📊 Results: Twitter=${twitterPosts.length}, Reddit=${redditPosts.length}, Dev.to=${devtoPosts.length}`);

  // Konwertuj do unified format
  const unified: UnifiedPost[] = [
    ...convertTwitterPosts(twitterPosts),
    ...convertRedditPosts(redditPosts),
    ...convertDevtoPosts(devtoPosts)
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

function convertTwitterPosts(posts: TwitterPost[]): UnifiedPost[] {
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
    timestamp: p.timestamp,
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

/**
 * Compute viral score for a post
 */
export function computeViralScore(post: UnifiedPost): number {
  const engagement = post.likes + post.comments * 2;
  const ageHours = (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60);
  const decay = Math.max(1, Math.pow(ageHours, 0.8));
  return Math.round((engagement / decay) * 100) / 100;
}
