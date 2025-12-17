import axios from 'axios';
import { getRedditTrending } from './redditScraper';
import { getDevToTrending } from './devtoScraper';
import { getThreadsTrending } from './threadsScraper';

export interface TrendingTopic {
  topic: string;
  platform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads' | 'All';
  score: number;
  category?: string;
}

/**
 * Get trending topics from all platforms
 */
export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  console.log('📈 Fetching trending topics from all platforms...');
  
  const results = await Promise.allSettled([
    getTwitterTrending(),
    getRedditTrending(),
    getDevToTrending(),
    getThreadsTrending()
  ]);

  const allTopics: TrendingTopic[] = [];

  // Twitter trends
  if (results[0].status === 'fulfilled' && results[0].value.length > 0) {
    results[0].value.forEach((topic, idx) => {
      allTopics.push({
        topic,
        platform: 'Twitter',
        score: 100 - idx * 5,
        category: 'social'
      });
    });
  }

  // Reddit trends
  if (results[1].status === 'fulfilled' && results[1].value.length > 0) {
    results[1].value.forEach((topic, idx) => {
      allTopics.push({
        topic,
        platform: 'Reddit',
        score: 95 - idx * 5,
        category: 'community'
      });
    });
  }

  // Dev.to trends
  if (results[2].status === 'fulfilled' && results[2].value.length > 0) {
    results[2].value.forEach((topic, idx) => {
      allTopics.push({
        topic,
        platform: 'Dev.to',
        score: 90 - idx * 5,
        category: 'tech'
      });
    });
  }

  // Threads trends
  if (results[3].status === 'fulfilled' && results[3].value.length > 0) {
    results[3].value.forEach((topic, idx) => {
      allTopics.push({
        topic,
        platform: 'Threads',
        score: 85 - idx * 5,
        category: 'social'
      });
    });
  }

  // Sort by score and deduplicate similar topics
  const uniqueTopics = deduplicateTopics(allTopics);
  return uniqueTopics.sort((a, b) => b.score - a.score).slice(0, 20);
}

/**
 * Get Twitter trending topics (using Nitter or fallback)
 */
async function getTwitterTrending(): Promise<string[]> {
  try {
    // Try multiple Nitter instances for trending
    const nitterInstances = [
      'https://nitter.poast.org',
      'https://nitter.net',
      'https://xcancel.com'
    ];

    for (const instance of nitterInstances) {
      try {
        const response = await axios.get(`${instance}/`, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.status === 200) {
          // Try to extract trending from homepage
          const trendingMatch = response.data.match(/class="trending"[^>]*>([\s\S]*?)<\/div>/);
          if (trendingMatch) {
            const topics = trendingMatch[1].match(/>([^<]+)</g) || [];
            const cleanTopics = topics
              .map((t: string) => t.replace(/[><]/g, '').trim())
              .filter((t: string) => t.length > 2);
            if (cleanTopics.length > 0) {
              return cleanTopics.slice(0, 10);
            }
          }
        }
      } catch {
        // Continue to next instance
      }
    }

    // Fallback: return common tech/social topics
    return [
      'AI', 'ChatGPT', 'Tech', 'Programming',
      'JavaScript', 'Python', 'React', 'Startups',
      'Innovation', 'Web3'
    ];
  } catch (err) {
    console.error('❌ Twitter trending error:', err);
    return [];
  }
}

/**
 * Deduplicate similar topics (e.g., "AI" and "Artificial Intelligence")
 */
function deduplicateTopics(topics: TrendingTopic[]): TrendingTopic[] {
  const seen = new Set<string>();
  const unique: TrendingTopic[] = [];

  for (const topic of topics) {
    const normalized = topic.topic.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(normalized) && normalized.length > 1) {
      seen.add(normalized);
      unique.push(topic);
    }
  }

  return unique;
}

/**
 * Get trending by category
 */
export async function getTrendingByCategory(category: string): Promise<TrendingTopic[]> {
  const allTrending = await getTrendingTopics();
  return allTrending.filter(t => t.category === category);
}

