/**
 * 💎 Undervalued Posts Service
 * Finds "hidden gems" - posts with high engagement from authors with low follower counts
 * These represent content that outperforms expectations and are great to learn from
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UndervaluedPost } from '../types';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// ============================================================================
// SCORING ALGORITHM
// ============================================================================

/**
 * Calculate undervalue score for a post
 * Higher score = more impressive engagement relative to follower count
 * 
 * Formula: (engagement_weighted / max(followers, 100)) * 1000
 * 
 * - engagement_weighted = likes + (comments * 2) + (shares * 3)
 * - Min follower threshold of 100 to avoid division issues
 * - Multiplied by 1000 for readability
 */
export function calculateUndervalueScore(
    likes: number,
    comments: number,
    shares: number = 0,
    authorFollowers: number
): number {
    const engagementWeighted = likes + (comments * 2) + (shares * 3);
    const effectiveFollowers = Math.max(authorFollowers, 100); // Minimum threshold

    const score = (engagementWeighted / effectiveFollowers) * 1000;
    return parseFloat(score.toFixed(2));
}

/**
 * Calculate engagement rate as percentage
 */
export function calculateEngagementRate(
    likes: number,
    comments: number,
    shares: number = 0,
    authorFollowers: number
): number {
    const totalEngagement = likes + comments + shares;
    const effectiveFollowers = Math.max(authorFollowers, 1);

    const rate = (totalEngagement / effectiveFollowers) * 100;
    return parseFloat(rate.toFixed(2));
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Find undervalued posts from stored metrics
 * Returns posts sorted by undervalue score (highest first)
 */
export async function getUndervaluedPosts(
    platform?: string,
    limit: number = 20,
    minEngagement: number = 50
): Promise<UndervaluedPost[]> {
    if (!supabase) {
        console.log('📊 Returning mock undervalued posts (no database)');
        return generateMockUndervaluedPosts(platform, limit);
    }

    try {
        // Get recent posts with engagement data
        let query = supabase
            .from('post_metrics')
            .select('*')
            .gte('likes', minEngagement)
            .order('recorded_at', { ascending: false })
            .limit(100);

        // Note: post_metrics doesn't have platform field in current schema
        // We'll need to parse from post_id or add platform field

        const { data, error } = await query;

        if (error) throw error;

        if (!data || data.length === 0) {
            return generateMockUndervaluedPosts(platform, limit);
        }

        // Calculate undervalue scores and format results
        const undervaluedPosts: UndervaluedPost[] = data.map(post => {
            // Estimate followers from engagement rate or use default
            const estimatedFollowers = post.engagement_rate > 0
                ? Math.floor((post.likes + post.replies) / (post.engagement_rate / 100))
                : 5000; // Default estimate

            const undervalueScore = calculateUndervalueScore(
                post.likes,
                post.replies,
                post.retweets,
                estimatedFollowers
            );

            const engagementRate = calculateEngagementRate(
                post.likes,
                post.replies,
                post.retweets,
                estimatedFollowers
            );

            return {
                post_id: post.post_id,
                author: post.author,
                platform: detectPlatformFromId(post.post_id),
                content: post.content || '',
                likes: post.likes,
                comments: post.replies,
                shares: post.retweets,
                author_followers: estimatedFollowers,
                engagement_rate: engagementRate,
                undervalue_score: undervalueScore
            };
        });

        // Filter by platform if specified
        let filtered = undervaluedPosts;
        if (platform) {
            filtered = undervaluedPosts.filter(p =>
                p.platform.toLowerCase() === platform.toLowerCase()
            );
        }

        // Sort by undervalue score and return top results
        return filtered
            .sort((a, b) => b.undervalue_score - a.undervalue_score)
            .slice(0, limit);

    } catch (error) {
        console.error('❌ Error fetching undervalued posts:', error);
        return generateMockUndervaluedPosts(platform, limit);
    }
}

/**
 * Analyze a list of posts and find the most undervalued ones
 * Use this with freshly scraped data
 */
export function findUndervaluedFromPosts(
    posts: Array<{
        id: string;
        author: string;
        platform: string;
        content: string;
        title?: string;
        likes: number;
        comments: number;
        shares?: number;
        authorFollowers?: number;
        postUrl?: string;
    }>,
    limit: number = 10
): UndervaluedPost[] {
    const analyzed = posts.map(post => {
        // Use actual followers or estimate based on engagement
        const authorFollowers = post.authorFollowers || estimateFollowers(post.likes, post.comments);

        const undervalueScore = calculateUndervalueScore(
            post.likes,
            post.comments,
            post.shares || 0,
            authorFollowers
        );

        const engagementRate = calculateEngagementRate(
            post.likes,
            post.comments,
            post.shares || 0,
            authorFollowers
        );

        return {
            post_id: post.id,
            author: post.author,
            platform: post.platform,
            content: post.content,
            title: post.title,
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            author_followers: authorFollowers,
            engagement_rate: engagementRate,
            undervalue_score: undervalueScore,
            postUrl: post.postUrl
        };
    });

    return analyzed
        .sort((a, b) => b.undervalue_score - a.undervalue_score)
        .slice(0, limit);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect platform from post ID prefix
 */
function detectPlatformFromId(postId: string): string {
    if (postId.startsWith('twitter-') || postId.startsWith('tweet-')) return 'Twitter';
    if (postId.startsWith('reddit-')) return 'Reddit';
    if (postId.startsWith('devto-')) return 'Dev.to';
    if (postId.startsWith('threads-')) return 'Threads';
    return 'Unknown';
}

/**
 * Estimate follower count based on engagement
 * This is a rough heuristic when we don't have actual follower data
 */
function estimateFollowers(likes: number, comments: number): number {
    // Assume average engagement rate of 2-5%
    const totalEngagement = likes + comments;
    const estimatedFollowers = totalEngagement / 0.03; // 3% engagement rate

    // Clamp to reasonable range
    return Math.max(100, Math.min(estimatedFollowers, 1000000));
}

// ============================================================================
// MOCK DATA
// ============================================================================

function generateMockUndervaluedPosts(platform?: string, limit: number = 10): UndervaluedPost[] {
    const mockData: UndervaluedPost[] = [
        {
            post_id: 'mock-1',
            author: 'unknown_dev_hero',
            platform: 'Twitter',
            content: '🔥 Just discovered this insane CSS trick that saves hours of work! Thread 🧵',
            likes: 5420,
            comments: 342,
            shares: 890,
            author_followers: 850,
            engagement_rate: 782.35,
            undervalue_score: 15847.06,
            postUrl: 'https://twitter.com/example/1'
        },
        {
            post_id: 'mock-2',
            author: 'indie_hacker_jane',
            platform: 'Twitter',
            content: 'Built my first SaaS in 30 days. Here\'s everything I learned (and messed up):',
            likes: 3200,
            comments: 189,
            shares: 456,
            author_followers: 420,
            engagement_rate: 914.05,
            undervalue_score: 12838.10,
            postUrl: 'https://twitter.com/example/2'
        },
        {
            post_id: 'mock-3',
            author: 'new_to_coding',
            platform: 'Reddit',
            content: 'I finally understood recursion after 6 months of trying. Here\'s my breakthrough moment...',
            likes: 2890,
            comments: 445,
            shares: 120,
            author_followers: 180,
            engagement_rate: 1919.44,
            undervalue_score: 24194.44,
            postUrl: 'https://reddit.com/example/3'
        },
        {
            post_id: 'mock-4',
            author: 'ai_beginner',
            platform: 'Dev.to',
            content: 'The simplest explanation of transformers I wish I had when starting',
            likes: 1890,
            comments: 234,
            author_followers: 320,
            engagement_rate: 663.75,
            undervalue_score: 7353.13,
            postUrl: 'https://dev.to/example/4'
        },
        {
            post_id: 'mock-5',
            author: 'startup_newbie',
            platform: 'Threads',
            content: 'Quit my job 3 months ago. Here\'s my honest update about indie hacking...',
            likes: 4500,
            comments: 567,
            author_followers: 670,
            engagement_rate: 756.12,
            undervalue_score: 9865.67,
            postUrl: 'https://threads.net/example/5'
        },
        {
            post_id: 'mock-6',
            author: 'react_learner',
            platform: 'Twitter',
            content: 'This one React pattern changed how I think about state management forever ⚛️',
            likes: 2100,
            comments: 156,
            shares: 234,
            author_followers: 290,
            engagement_rate: 858.62,
            undervalue_score: 10393.10,
        },
        {
            post_id: 'mock-7',
            author: 'python_padawan',
            platform: 'Reddit',
            content: 'After 1 year of learning Python, here are the 10 things I wish I knew from day 1',
            likes: 3400,
            comments: 289,
            shares: 167,
            author_followers: 540,
            engagement_rate: 714.07,
            undervalue_score: 8846.30,
        },
        {
            post_id: 'mock-8',
            author: 'design_newbie',
            platform: 'Threads',
            content: 'I redesigned 5 famous logos as a learning exercise. Here\'s what I learned about design principles:',
            likes: 1800,
            comments: 423,
            author_followers: 380,
            engagement_rate: 584.74,
            undervalue_score: 6963.16,
        }
    ];

    let filtered = mockData;
    if (platform) {
        filtered = mockData.filter(p => p.platform.toLowerCase() === platform.toLowerCase());
    }

    return filtered
        .sort((a, b) => b.undervalue_score - a.undervalue_score)
        .slice(0, limit);
}
