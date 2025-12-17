/**
 * 📅 Scheduler Service - Automatic Scheduled Post Publishing
 * Checks for due posts every minute and publishes them automatically
 */

import { createClient } from '@supabase/supabase-js';
import { PlannedPost } from '../types';
import { publishToAllPlatforms, publishToPlatform } from './publishingService';

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Scheduler state
let schedulerInterval: NodeJS.Timeout | null = null;
let isRunning = false;
const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

// In-memory storage for posts (fallback when no database)
let inMemoryPosts: PlannedPost[] = [];

/**
 * Start the scheduler
 */
export function startScheduler(): void {
    if (schedulerInterval) {
        console.log('⚠️ Scheduler already running');
        return;
    }

    console.log('');
    console.log('📅 ========================================');
    console.log('   Scheduler Service Started');
    console.log('   ========================================');
    console.log(`   Checking for due posts every ${CHECK_INTERVAL_MS / 1000}s`);
    console.log('   ========================================');
    console.log('');

    isRunning = true;

    // Run immediately on start
    checkAndPublishDuePosts();

    // Then run every minute
    schedulerInterval = setInterval(() => {
        checkAndPublishDuePosts();
    }, CHECK_INTERVAL_MS);
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        isRunning = false;
        console.log('🛑 Scheduler stopped');
    }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
    running: boolean;
    checkIntervalMs: number;
    nextCheckIn: number;
} {
    return {
        running: isRunning,
        checkIntervalMs: CHECK_INTERVAL_MS,
        nextCheckIn: isRunning ? CHECK_INTERVAL_MS : 0
    };
}

/**
 * Check for posts due to be published and publish them
 */
async function checkAndPublishDuePosts(): Promise<void> {
    const now = new Date();
    console.log(`\n⏰ [${now.toISOString()}] Checking for scheduled posts...`);

    try {
        const duePosts = await getDuePosts();

        if (duePosts.length === 0) {
            console.log('   No posts due for publishing');
            return;
        }

        console.log(`   Found ${duePosts.length} post(s) due for publishing`);

        for (const post of duePosts) {
            await publishScheduledPost(post);
        }

    } catch (error) {
        console.error('❌ Scheduler error:', error);
    }
}

/**
 * Get posts that are due for publishing
 */
async function getDuePosts(): Promise<PlannedPost[]> {
    const now = new Date().toISOString();

    if (supabase) {
        // Use database
        const { data, error } = await supabase
            .from('planned_posts')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_date', now)
            .order('scheduled_date', { ascending: true });

        if (error) {
            console.error('❌ Database error:', error);
            return [];
        }

        return data || [];
    } else {
        // Use in-memory storage
        return inMemoryPosts.filter(post =>
            post.status === 'scheduled' &&
            post.scheduled_date &&
            new Date(post.scheduled_date) <= new Date()
        );
    }
}

/**
 * Publish a scheduled post
 */
async function publishScheduledPost(post: PlannedPost): Promise<void> {
    console.log(`\n📤 Publishing post ${post.id} to ${post.platform}...`);
    console.log(`   Content: ${post.content.substring(0, 50)}...`);

    try {
        let result;

        if (post.platform === 'all') {
            result = await publishToAllPlatforms(post);
            console.log(`   Results: ${result.publishedCount} published, ${result.failedCount} failed`);

            for (const r of result.results) {
                if (r.success) {
                    console.log(`   ✅ ${r.platform}: ${r.postUrl}`);
                } else {
                    console.log(`   ❌ ${r.platform}: ${r.error}`);
                }
            }
        } else {
            const singleResult = await publishToPlatform(post.platform, post.content, {
                hashtags: post.hashtags,
                title: post.original_content?.substring(0, 100)
            });

            if (singleResult.success) {
                console.log(`   ✅ ${singleResult.platform}: ${singleResult.postUrl}`);
            } else {
                console.log(`   ❌ ${singleResult.platform}: ${singleResult.error}`);
            }

            result = { overall: singleResult.success };
        }

        // Update post status to published
        if (result.overall) {
            await updatePostStatus(post.id, 'published');
            console.log(`   📝 Status updated to 'published'`);
        } else {
            console.log(`   ⚠️ Publishing failed, status remains 'scheduled'`);
        }

    } catch (error) {
        console.error(`   ❌ Error publishing post ${post.id}:`, error);
    }
}

/**
 * Update post status in database
 */
async function updatePostStatus(postId: string, status: 'draft' | 'scheduled' | 'published'): Promise<void> {
    if (supabase) {
        const { error } = await supabase
            .from('planned_posts')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', postId);

        if (error) {
            console.error('❌ Failed to update post status:', error);
        }
    } else {
        // Update in-memory
        const post = inMemoryPosts.find(p => p.id === postId);
        if (post) {
            post.status = status;
            post.updated_at = new Date().toISOString();
        }
    }
}

/**
 * Schedule a post for publishing
 */
export async function schedulePost(params: {
    content: string;
    platform: string;
    scheduledFor: Date;
    hashtags?: string[];
}): Promise<PlannedPost> {
    const post: PlannedPost = {
        id: `post-${Date.now()}`,
        content: params.content,
        platform: params.platform as PlannedPost['platform'],
        hashtags: params.hashtags,
        scheduled_date: params.scheduledFor.toISOString(),
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    if (supabase) {
        const { data, error } = await supabase
            .from('planned_posts')
            .insert(post)
            .select()
            .single();

        if (error) {
            console.error('❌ Failed to schedule post:', error);
            throw error;
        }

        return data;
    } else {
        inMemoryPosts.push(post);
        console.log(`📅 Post ${post.id} scheduled for ${post.scheduled_date}`);
        return post;
    }
}

/**
 * Get all scheduled posts with filtering
 */
export async function getScheduledPosts(status: string = 'pending', limit: number = 50): Promise<PlannedPost[]> {
    const statusMap: Record<string, string> = {
        'pending': 'scheduled',
        'posted': 'published',
        'failed': 'failed'
    };
    const dbStatus = statusMap[status] || status;

    if (supabase) {
        const { data, error } = await supabase
            .from('planned_posts')
            .select('*')
            .eq('status', dbStatus)
            .order('scheduled_date', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('❌ Failed to get posts:', error);
            return [];
        }

        return data || [];
    } else {
        return inMemoryPosts
            .filter(p => p.status === dbStatus)
            .slice(0, limit);
    }
}

/**
 * Cancel a scheduled post
 */
export async function cancelScheduledPost(postId: string): Promise<boolean> {
    if (supabase) {
        const { error } = await supabase
            .from('planned_posts')
            .delete()
            .eq('id', postId);

        return !error;
    } else {
        const index = inMemoryPosts.findIndex(p => p.id === postId);
        if (index > -1) {
            inMemoryPosts.splice(index, 1);
            return true;
        }
        return false;
    }
}

/**
 * Reschedule a post to a new time
 */
export async function reschedulePost(postId: string, newTime: Date): Promise<PlannedPost | null> {
    if (supabase) {
        const { data, error } = await supabase
            .from('planned_posts')
            .update({
                scheduled_date: newTime.toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', postId)
            .select()
            .single();

        if (error) {
            console.error('❌ Failed to reschedule post:', error);
            return null;
        }

        return data;
    } else {
        const post = inMemoryPosts.find(p => p.id === postId);
        if (post) {
            post.scheduled_date = newTime.toISOString();
            post.updated_at = new Date().toISOString();
            return post;
        }
        return null;
    }
}

/**
 * Manually trigger a check (for testing)
 */
export async function triggerCheck(): Promise<{ checked: number; published: number }> {
    const duePosts = await getDuePosts();
    let published = 0;

    for (const post of duePosts) {
        await publishScheduledPost(post);
        published++;
    }

    return { checked: duePosts.length, published };
}

