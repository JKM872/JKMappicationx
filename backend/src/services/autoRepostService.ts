/**
 * 🔄 Auto-Repost Service
 * Automatically resurfaces top-performing content
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// INITIALIZATION
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// ============================================================================
// TYPES
// ============================================================================

export interface AutoRepostSettings {
    enabled: boolean;
    minEngagementRate: number; // Minimum engagement rate to qualify
    minDaysSincePosted: number; // Don't repost too recently
    maxDaysSincePosted: number; // Don't repost too old content
    maxRepostsPerDay: number;
    platforms: string[];
    excludeHashtags?: string[];
    preferredTimes?: string[]; // e.g., ["09:00", "17:00"]
}

export interface RepostCandidate {
    post_id: string;
    content: string;
    platform: string;
    original_date: Date;
    engagement_rate: number;
    likes: number;
    comments: number;
    shares: number;
    repost_score: number;
    suggested_time?: string;
}

export interface ScheduledRepost {
    id: string;
    original_post_id: string;
    content: string;
    platform: string;
    scheduled_for: Date;
    status: 'pending' | 'posted' | 'cancelled';
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const DEFAULT_SETTINGS: AutoRepostSettings = {
    enabled: false,
    minEngagementRate: 2.0, // 2% minimum
    minDaysSincePosted: 30, // Wait at least 30 days
    maxDaysSincePosted: 180, // Don't repost older than 6 months
    maxRepostsPerDay: 2,
    platforms: ['Twitter', 'Threads'],
    preferredTimes: ['09:00', '17:00', '20:00']
};

// In-memory storage for settings (would use database in production)
let currentSettings: AutoRepostSettings = { ...DEFAULT_SETTINGS };
let scheduledReposts: ScheduledRepost[] = [];

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

/**
 * Get current auto-repost settings
 */
export function getAutoRepostSettings(): AutoRepostSettings {
    return { ...currentSettings };
}

/**
 * Update auto-repost settings
 */
export function updateAutoRepostSettings(settings: Partial<AutoRepostSettings>): AutoRepostSettings {
    currentSettings = { ...currentSettings, ...settings };
    console.log('✅ Auto-repost settings updated:', currentSettings);
    return currentSettings;
}

/**
 * Enable or disable auto-repost
 */
export function setAutoRepostEnabled(enabled: boolean): AutoRepostSettings {
    currentSettings.enabled = enabled;
    console.log(`${enabled ? '✅' : '⏸️'} Auto-repost ${enabled ? 'enabled' : 'disabled'}`);
    return currentSettings;
}

// ============================================================================
// CANDIDATE FINDING
// ============================================================================

/**
 * Find top-performing posts that are good candidates for reposting
 */
export async function findRepostCandidates(
    limit: number = 10
): Promise<RepostCandidate[]> {
    if (!supabase) {
        console.warn('⚠️ Supabase not configured, returning mock candidates');
        return generateMockCandidates(limit);
    }

    try {
        const settings = currentSettings;
        const now = new Date();
        const minDate = new Date(now.getTime() - settings.maxDaysSincePosted * 24 * 60 * 60 * 1000);
        const maxDate = new Date(now.getTime() - settings.minDaysSincePosted * 24 * 60 * 60 * 1000);

        const { data, error } = await supabase
            .from('post_metrics')
            .select('*')
            .gte('recorded_at', minDate.toISOString())
            .lte('recorded_at', maxDate.toISOString())
            .order('likes', { ascending: false })
            .limit(limit * 2); // Get more than needed for filtering

        if (error) throw error;

        if (!data || data.length === 0) {
            return generateMockCandidates(limit);
        }

        // Calculate repost score and filter
        const candidates: RepostCandidate[] = data
            .map(post => {
                const totalEngagement = (post.likes || 0) + (post.comments || 0) * 2 + (post.shares || 0) * 3;
                const engagementRate = totalEngagement / 100; // Simplified calculation

                // Calculate repost score (higher = better candidate)
                const repostScore = calculateRepostScore(post, engagementRate);

                return {
                    post_id: post.post_id,
                    content: post.content || '',
                    platform: post.platform || 'Twitter',
                    original_date: new Date(post.recorded_at),
                    engagement_rate: engagementRate,
                    likes: post.likes || 0,
                    comments: post.comments || 0,
                    shares: post.shares || 0,
                    repost_score: repostScore,
                    suggested_time: settings.preferredTimes?.[0]
                };
            })
            .filter(c => c.engagement_rate >= settings.minEngagementRate)
            .sort((a, b) => b.repost_score - a.repost_score)
            .slice(0, limit);

        return candidates;

    } catch (error) {
        console.error('❌ Error finding repost candidates:', error);
        return generateMockCandidates(limit);
    }
}

/**
 * Calculate repost worthiness score
 */
function calculateRepostScore(post: any, engagementRate: number): number {
    let score = 0;

    // Base score from engagement
    score += engagementRate * 10;

    // Bonus for high likes
    if (post.likes > 1000) score += 20;
    else if (post.likes > 500) score += 15;
    else if (post.likes > 100) score += 10;

    // Bonus for comments (indicate discussion-worthy content)
    if (post.comments > 50) score += 15;
    else if (post.comments > 20) score += 10;

    // Bonus for shares (highest quality signal)
    if (post.shares > 100) score += 25;
    else if (post.shares > 50) score += 20;
    else if (post.shares > 10) score += 10;

    return Math.round(score);
}

// ============================================================================
// REPOST SCHEDULING
// ============================================================================

/**
 * Schedule a post for reposting
 */
export function scheduleRepost(
    candidate: RepostCandidate,
    scheduledFor: Date
): ScheduledRepost {
    const repost: ScheduledRepost = {
        id: `repost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        original_post_id: candidate.post_id,
        content: candidate.content,
        platform: candidate.platform,
        scheduled_for: scheduledFor,
        status: 'pending'
    };

    scheduledReposts.push(repost);
    console.log(`📅 Scheduled repost for ${scheduledFor.toISOString()}`);

    return repost;
}

/**
 * Get all scheduled reposts
 */
export function getScheduledReposts(): ScheduledRepost[] {
    return [...scheduledReposts].sort(
        (a, b) => a.scheduled_for.getTime() - b.scheduled_for.getTime()
    );
}

/**
 * Cancel a scheduled repost
 */
export function cancelRepost(repostId: string): boolean {
    const repost = scheduledReposts.find(r => r.id === repostId);
    if (repost && repost.status === 'pending') {
        repost.status = 'cancelled';
        console.log(`❌ Cancelled repost: ${repostId}`);
        return true;
    }
    return false;
}

/**
 * Get pending reposts due now
 */
export function getPendingReposts(): ScheduledRepost[] {
    const now = new Date();
    return scheduledReposts.filter(
        r => r.status === 'pending' && r.scheduled_for <= now
    );
}

/**
 * Mark repost as posted
 */
export function markRepostAsPosted(repostId: string): boolean {
    const repost = scheduledReposts.find(r => r.id === repostId);
    if (repost) {
        repost.status = 'posted';
        console.log(`✅ Marked as posted: ${repostId}`);
        return true;
    }
    return false;
}

// ============================================================================
// MOCK DATA
// ============================================================================

function generateMockCandidates(limit: number): RepostCandidate[] {
    const mockContent = [
        'The best developers I know spend 80% of their time reading code, 20% writing it.',
        '🚀 Just hit 10K followers! Here\'s the ONE thing that made the difference...',
        'Hot take: Most "best practices" are just cargo cult programming.',
        'Every senior dev started as someone who had no idea what they were doing.',
        'The secret to productive mornings? Start with the hardest task first.',
        'AI won\'t replace developers. Developers using AI will replace those who don\'t.',
        'Your code doesn\'t need more comments. It needs better variable names.',
        'Thread: 5 years of freelancing taught me these 7 hard lessons 🧵',
    ];

    const candidates: RepostCandidate[] = mockContent.slice(0, limit).map((content, idx) => ({
        post_id: `mock-${idx + 1}`,
        content,
        platform: idx % 2 === 0 ? 'Twitter' : 'Threads',
        original_date: new Date(Date.now() - (45 + idx * 15) * 24 * 60 * 60 * 1000),
        engagement_rate: 3.5 + Math.random() * 4,
        likes: Math.floor(500 + Math.random() * 2000),
        comments: Math.floor(20 + Math.random() * 100),
        shares: Math.floor(50 + Math.random() * 200),
        repost_score: 70 + Math.floor(Math.random() * 30),
        suggested_time: currentSettings.preferredTimes?.[idx % 3]
    }));

    return candidates;
}
