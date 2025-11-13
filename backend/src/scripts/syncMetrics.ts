import dotenv from 'dotenv';
import { getTopPostsByEngagement } from '../services/metricsService';

// Load environment variables
dotenv.config();

/**
 * Sync metrics script - can be used for reporting or cleanup
 * Run with: npm run sync:metrics
 */
async function syncMetrics() {
  console.log('📊 Syncing metrics...');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log('');

  try {
    // Get top posts from last 24 hours
    const topPosts = await getTopPostsByEngagement(24, 20);

    console.log(`📈 Top ${topPosts.length} posts in last 24 hours:`);
    console.log('');

    topPosts.forEach((post, idx) => {
      console.log(`${idx + 1}. @${post.author}`);
      console.log(`   Content: ${post.content.substring(0, 100)}...`);
      console.log(`   ❤️ ${post.likes} | 🔁 ${post.retweets} | 💬 ${post.replies}`);
      console.log(`   Engagement Rate: ${post.engagement_rate}%`);
      console.log('');
    });

    console.log('✅ Sync completed successfully!');
  } catch (error) {
    console.error('❌ Sync error:', (error as Error).message);
    process.exit(1);
  }
}

// Run the sync
syncMetrics();
