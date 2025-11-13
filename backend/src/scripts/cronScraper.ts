import dotenv from 'dotenv';
import { fetchNitterSearch, rankPostsByScore } from '../services/scraperService';
import { saveMetricsBatch, calculateEngagementRate } from '../services/metricsService';
import { PostMetric } from '../types';

// Load environment variables
dotenv.config();

// Predefined search queries for automatic scraping
const SEARCH_QUERIES = [
  'javascript',
  'typescript',
  'react',
  'nodejs',
  'webdev',
  'AI',
  'machinelearning',
  'programming',
];

/**
 * Cron job script for automated scraping
 * Run this with: npm run scrape:cron
 */
async function runCronScraper() {
  console.log('🚀 Starting scheduled scraper...');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`🔍 Queries: ${SEARCH_QUERIES.join(', ')}`);
  console.log('');

  const allMetrics: PostMetric[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      console.log(`🔎 Scraping: "${query}"`);

      // Fetch top posts
      const posts = await fetchNitterSearch(query, 10);
      const rankedPosts = rankPostsByScore(posts);

      console.log(`✅ Found ${rankedPosts.length} posts`);

      // Convert to metrics format
      const metrics: PostMetric[] = rankedPosts.map((post) => ({
        post_id: `${post.author}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        author: post.author,
        content: post.content,
        likes: post.likes,
        retweets: post.retweets,
        replies: post.replies,
        engagement_rate: calculateEngagementRate(
          post.likes,
          post.retweets,
          post.replies,
          post.authorFollowers
        ),
        recorded_at: new Date(),
      }));

      allMetrics.push(...metrics);

      // Delay between queries to avoid rate limiting
      await sleep(2000);
    } catch (error) {
      console.error(`❌ Error scraping "${query}":`, (error as Error).message);
    }
  }

  // Save all metrics to database
  if (allMetrics.length > 0) {
    try {
      console.log('');
      console.log(`💾 Saving ${allMetrics.length} metrics to database...`);
      await saveMetricsBatch(allMetrics);
      console.log('✅ Metrics saved successfully!');
    } catch (error) {
      console.error('❌ Error saving metrics:', (error as Error).message);
    }
  } else {
    console.warn('⚠️ No metrics to save');
  }

  console.log('');
  console.log('✅ Scraping job completed!');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run the scraper
runCronScraper().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
