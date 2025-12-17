/**
 * 📈 Author Growth Service
 * Tracks author follower counts over time and calculates growth metrics
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthorStats, AuthorGrowth } from '../types';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// ============================================================================
// AUTHOR GROWTH FUNCTIONS
// ============================================================================

/**
 * Save author statistics snapshot
 * Call this during scraping to track follower changes over time
 */
export async function saveAuthorStats(stats: Omit<AuthorStats, 'id' | 'recorded_at'>): Promise<boolean> {
    if (!supabase) {
        console.warn('⚠️ Supabase not initialized - cannot save author stats');
        return false;
    }

    try {
        const { error } = await supabase
            .from('author_stats')
            .insert([{
                author_handle: stats.author_handle,
                platform: stats.platform,
                followers_count: stats.followers_count,
                following_count: stats.following_count || 0,
                posts_count: stats.posts_count || 0,
                recorded_at: new Date().toISOString()
            }]);

        if (error) throw error;

        console.log(`✅ Saved stats for @${stats.author_handle}: ${stats.followers_count} followers`);
        return true;
    } catch (error) {
        console.error('❌ Error saving author stats:', error);
        return false;
    }
}

/**
 * Save multiple author stats in batch
 */
export async function saveAuthorStatsBatch(statsList: Omit<AuthorStats, 'id' | 'recorded_at'>[]): Promise<number> {
    if (!supabase || statsList.length === 0) return 0;

    try {
        const records = statsList.map(stats => ({
            author_handle: stats.author_handle,
            platform: stats.platform,
            followers_count: stats.followers_count,
            following_count: stats.following_count || 0,
            posts_count: stats.posts_count || 0,
            recorded_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('author_stats')
            .insert(records);

        if (error) throw error;

        console.log(`✅ Saved ${records.length} author stats in batch`);
        return records.length;
    } catch (error) {
        console.error('❌ Error saving author stats batch:', error);
        return 0;
    }
}

/**
 * Get author's follower history
 */
export async function getAuthorHistory(
    authorHandle: string,
    platform: string,
    limit: number = 100
): Promise<AuthorStats[]> {
    if (!supabase) {
        console.warn('⚠️ Supabase not initialized');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('author_stats')
            .select('*')
            .eq('author_handle', authorHandle)
            .eq('platform', platform)
            .order('recorded_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('❌ Error fetching author history:', error);
        return [];
    }
}

/**
 * Calculate author growth over a time period
 */
export async function getAuthorGrowth(
    authorHandle: string,
    platform: string,
    periodHours: number = 168 // 7 days default
): Promise<AuthorGrowth | null> {
    if (!supabase) {
        return generateMockGrowth(authorHandle, platform, periodHours);
    }

    try {
        // Get current (latest) stats
        const { data: currentData } = await supabase
            .from('author_stats')
            .select('*')
            .eq('author_handle', authorHandle)
            .eq('platform', platform)
            .order('recorded_at', { ascending: false })
            .limit(1);

        if (!currentData || currentData.length === 0) {
            return null;
        }

        // Get previous stats from periodHours ago
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - periodHours);

        const { data: previousData } = await supabase
            .from('author_stats')
            .select('*')
            .eq('author_handle', authorHandle)
            .eq('platform', platform)
            .lte('recorded_at', cutoffTime.toISOString())
            .order('recorded_at', { ascending: false })
            .limit(1);

        const current = currentData[0];
        const previous = previousData?.[0] || current; // Use current if no previous

        const growth: AuthorGrowth = {
            author_handle: authorHandle,
            platform: platform,
            current_followers: current.followers_count,
            previous_followers: previous.followers_count,
            growth_absolute: current.followers_count - previous.followers_count,
            growth_percentage: previous.followers_count > 0
                ? ((current.followers_count - previous.followers_count) / previous.followers_count) * 100
                : 0,
            period_hours: periodHours
        };

        return growth;
    } catch (error) {
        console.error('❌ Error calculating author growth:', error);
        return null;
    }
}

/**
 * Get top growing authors
 */
export async function getTopGrowingAuthors(
    platform?: string,
    periodHours: number = 168,
    limit: number = 10
): Promise<AuthorGrowth[]> {
    if (!supabase) {
        return generateMockTopGrowing(platform, limit);
    }

    try {
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - periodHours);

        // Get all unique authors with recent activity
        let query = supabase
            .from('author_stats')
            .select('author_handle, platform')
            .gte('recorded_at', cutoffTime.toISOString());

        if (platform) {
            query = query.eq('platform', platform);
        }

        const { data: authors } = await query;

        if (!authors || authors.length === 0) {
            return generateMockTopGrowing(platform, limit);
        }

        // Get unique author-platform combinations
        const uniqueAuthors = Array.from(
            new Map(authors.map(a => [`${a.author_handle}-${a.platform}`, a])).values()
        );

        // Calculate growth for each author
        const growthPromises = uniqueAuthors.map(a =>
            getAuthorGrowth(a.author_handle, a.platform, periodHours)
        );

        const growthResults = await Promise.all(growthPromises);

        // Filter and sort by absolute growth
        const validGrowth = growthResults
            .filter((g): g is AuthorGrowth => g !== null && g.growth_absolute > 0)
            .sort((a, b) => b.growth_absolute - a.growth_absolute)
            .slice(0, limit);

        if (validGrowth.length === 0) {
            return generateMockTopGrowing(platform, limit);
        }

        return validGrowth;
    } catch (error) {
        console.error('❌ Error fetching top growing authors:', error);
        return generateMockTopGrowing(platform, limit);
    }
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

function generateMockGrowth(authorHandle: string, platform: string, periodHours: number): AuthorGrowth {
    const currentFollowers = Math.floor(Math.random() * 50000) + 1000;
    const growthPercent = (Math.random() * 20) - 5; // -5% to +15%
    const previousFollowers = Math.floor(currentFollowers / (1 + growthPercent / 100));

    return {
        author_handle: authorHandle,
        platform,
        current_followers: currentFollowers,
        previous_followers: previousFollowers,
        growth_absolute: currentFollowers - previousFollowers,
        growth_percentage: parseFloat(growthPercent.toFixed(2)),
        period_hours: periodHours
    };
}

function generateMockTopGrowing(platform?: string, limit: number = 10): AuthorGrowth[] {
    const platforms = platform ? [platform] : ['Twitter', 'Reddit', 'Dev.to', 'Threads'];
    const mockAuthors = [
        'viral_coder', 'tech_insider', 'ai_wizard', 'startup_guru', 'code_master',
        'dev_ninja', 'web3_pioneer', 'data_scientist', 'ml_expert', 'full_stack_hero'
    ];

    return mockAuthors.slice(0, limit).map((author, idx) => {
        const currentFollowers = Math.floor(Math.random() * 100000) + 10000;
        const growthRate = 0.15 - (idx * 0.01); // Descending growth rate
        const previousFollowers = Math.floor(currentFollowers / (1 + growthRate));

        return {
            author_handle: author,
            platform: platforms[idx % platforms.length],
            current_followers: currentFollowers,
            previous_followers: previousFollowers,
            growth_absolute: currentFollowers - previousFollowers,
            growth_percentage: parseFloat((growthRate * 100).toFixed(2)),
            period_hours: 168
        };
    }).sort((a, b) => b.growth_absolute - a.growth_absolute);
}
