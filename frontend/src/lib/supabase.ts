import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create Supabase client (or null if not configured)
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : null;

// Database types based on the schema
export interface AuthorStats {
    id: string;
    author_handle: string;
    platform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads';
    followers_count: number;
    following_count: number;
    posts_count: number;
    recorded_at: string;
    created_at: string;
}

export interface ViralityPrediction {
    id: string;
    post_id: string;
    platform: string;
    content: string | null;
    author: string | null;
    viral_score: number;
    confidence: number;
    predicted_reach: string | null;
    factors: Record<string, unknown> | null;
    predicted_at: string;
}

export interface ScheduledPost {
    id: string;
    content: string;
    platform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads';
    hashtags: string[] | null;
    scheduled_for: string;
    status: 'scheduled' | 'published' | 'failed' | 'cancelled';
    published_at: string | null;
    post_url: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
}

export interface ScheduledRepost {
    id: string;
    original_post_id: string;
    content: string;
    platform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads';
    scheduled_for: string;
    status: 'pending' | 'posted' | 'cancelled' | 'failed';
    original_engagement: Record<string, unknown> | null;
    repost_score: number;
    posted_at: string | null;
    post_url: string | null;
    error_message: string | null;
    created_at: string;
}

// Helper functions for common operations

/**
 * Get author growth statistics
 */
export async function getAuthorStats(authorHandle: string, platform: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };

    return supabase
        .from('author_stats')
        .select('*')
        .eq('author_handle', authorHandle)
        .eq('platform', platform)
        .order('recorded_at', { ascending: false })
        .limit(30);
}

/**
 * Get all virality predictions
 */
export async function getViralityPredictions(limit = 50) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };

    return supabase
        .from('virality_predictions')
        .select('*')
        .order('viral_score', { ascending: false })
        .limit(limit);
}

/**
 * Get scheduled posts
 */
export async function getScheduledPosts(status?: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };

    let query = supabase
        .from('scheduled_posts')
        .select('*')
        .order('scheduled_for', { ascending: true });

    if (status) {
        query = query.eq('status', status);
    }

    return query;
}

/**
 * Create a scheduled post
 */
export async function createScheduledPost(
    content: string,
    platform: string,
    scheduledFor: Date,
    hashtags?: string[]
) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };

    return supabase
        .from('scheduled_posts')
        .insert({
            content,
            platform,
            hashtags,
            scheduled_for: scheduledFor.toISOString(),
            status: 'scheduled'
        })
        .select()
        .single();
}

/**
 * Update scheduled post status
 */
export async function updateScheduledPostStatus(
    postId: string,
    status: 'scheduled' | 'published' | 'failed' | 'cancelled',
    postUrl?: string,
    errorMessage?: string
) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };

    const updateData: Record<string, unknown> = { status };

    if (status === 'published') {
        updateData.published_at = new Date().toISOString();
        if (postUrl) updateData.post_url = postUrl;
    }

    if (status === 'failed' && errorMessage) {
        updateData.error_message = errorMessage;
    }

    return supabase
        .from('scheduled_posts')
        .update(updateData)
        .eq('id', postId)
        .select()
        .single();
}

/**
 * Delete a scheduled post
 */
export async function deleteScheduledPost(postId: string) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };

    return supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId);
}

/**
 * Record author stats snapshot
 */
export async function recordAuthorStats(
    authorHandle: string,
    platform: string,
    followersCount: number,
    followingCount?: number,
    postsCount?: number
) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };

    return supabase
        .from('author_stats')
        .insert({
            author_handle: authorHandle,
            platform,
            followers_count: followersCount,
            following_count: followingCount || 0,
            posts_count: postsCount || 0
        })
        .select()
        .single();
}

/**
 * Save virality prediction
 */
export async function saveViralityPrediction(
    postId: string,
    platform: string,
    viralScore: number,
    confidence: number,
    content?: string,
    author?: string,
    predictedReach?: string,
    factors?: Record<string, unknown>
) {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };

    return supabase
        .from('virality_predictions')
        .insert({
            post_id: postId,
            platform,
            viral_score: viralScore,
            confidence,
            content,
            author,
            predicted_reach: predictedReach,
            factors
        })
        .select()
        .single();
}

export default supabase;
