/**
 * 📈 Trending Topics Service
 * Fetches and caches trending topics from various sources
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

export interface TrendingTopic {
    tag: string;
    category: string;
    trending: boolean;
    postCount?: number;
    growthPercent?: number;
}

// ============================================================================
// CACHE
// ============================================================================

interface TopicCache {
    topics: TrendingTopic[];
    lastFetched: Date;
}

let topicCache: TopicCache | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ============================================================================
// TOPIC SOURCES
// ============================================================================

/**
 * Get trending topics - combines multiple sources
 */
export async function getTrendingTopics(): Promise<TrendingTopic[]> {
    // Check cache first
    if (topicCache && (Date.now() - topicCache.lastFetched.getTime()) < CACHE_TTL_MS) {
        console.log('📦 Returning cached trending topics');
        return topicCache.topics;
    }

    console.log('🔄 Fetching fresh trending topics...');

    try {
        // Combine topics from multiple sources
        const [searchBasedTopics, staticTopics] = await Promise.all([
            getTopicsFromSearchHistory(),
            getStaticTrendingTopics()
        ]);

        // Merge and deduplicate
        const topicMap = new Map<string, TrendingTopic>();

        // Add search-based topics first (higher priority)
        searchBasedTopics.forEach(t => topicMap.set(t.tag.toLowerCase(), t));

        // Add static topics if not already present
        staticTopics.forEach(t => {
            if (!topicMap.has(t.tag.toLowerCase())) {
                topicMap.set(t.tag.toLowerCase(), t);
            }
        });

        const topics = Array.from(topicMap.values())
            .sort((a, b) => {
                // Trending topics first
                if (a.trending !== b.trending) return a.trending ? -1 : 1;
                // Then by post count
                return (b.postCount || 0) - (a.postCount || 0);
            })
            .slice(0, 15); // Limit to 15 topics

        // Update cache
        topicCache = {
            topics,
            lastFetched: new Date()
        };

        return topics;

    } catch (error) {
        console.error('❌ Error fetching trending topics:', error);
        return getStaticTrendingTopics();
    }
}

/**
 * Get topics based on search history (what users are searching for)
 */
async function getTopicsFromSearchHistory(): Promise<TrendingTopic[]> {
    if (!supabase) {
        return [];
    }

    try {
        // This would query a search_history table if it exists
        // For now, return empty since we don't have that table
        return [];
    } catch (error) {
        console.warn('⚠️ Could not fetch search history topics');
        return [];
    }
}

/**
 * Static trending topics - curated list that updates periodically
 */
function getStaticTrendingTopics(): TrendingTopic[] {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    // Base topics that are always relevant
    const baseTopics: TrendingTopic[] = [
        { tag: 'AI coding tips', category: 'Tech', trending: true, postCount: 15200 },
        { tag: 'marketing strategies', category: 'Business', trending: true, postCount: 8900 },
        { tag: 'startup advice', category: 'Business', trending: false, postCount: 5400 },
        { tag: 'productivity hacks', category: 'Lifestyle', trending: true, postCount: 12100 },
        { tag: 'design trends', category: 'Creative', trending: false, postCount: 4300 },
        { tag: 'growth tactics', category: 'Marketing', trending: true, postCount: 7600 },
        { tag: 'web development', category: 'Tech', trending: true, postCount: 18500 },
        { tag: 'career tips', category: 'Professional', trending: false, postCount: 3200 },
        { tag: 'content creation', category: 'Creative', trending: false, postCount: 6100 },
        { tag: 'side hustle', category: 'Business', trending: true, postCount: 9800 },
    ];

    // Time-based trending topics
    const timeBasedTopics: TrendingTopic[] = [];

    // Morning topics (6 AM - 12 PM)
    if (hour >= 6 && hour < 12) {
        timeBasedTopics.push(
            { tag: 'morning routine', category: 'Lifestyle', trending: true, postCount: Math.floor(Math.random() * 5000 + 3000) }
        );
    }

    // Afternoon topics (12 PM - 6 PM)
    if (hour >= 12 && hour < 18) {
        timeBasedTopics.push(
            { tag: 'work from home', category: 'Professional', trending: true, postCount: Math.floor(Math.random() * 4000 + 2000) }
        );
    }

    // Evening topics (6 PM - 12 AM)
    if (hour >= 18 || hour < 6) {
        timeBasedTopics.push(
            { tag: 'side project', category: 'Tech', trending: true, postCount: Math.floor(Math.random() * 6000 + 4000) }
        );
    }

    // Weekend topics
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        timeBasedTopics.push(
            { tag: 'weekend reads', category: 'Lifestyle', trending: true, postCount: Math.floor(Math.random() * 3000 + 2000) }
        );
    }

    // Weekday topics
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        timeBasedTopics.push(
            { tag: 'tech news', category: 'Tech', trending: true, postCount: Math.floor(Math.random() * 10000 + 5000) }
        );
    }

    return [...timeBasedTopics, ...baseTopics];
}

/**
 * Get topics by category
 */
export function getTopicsByCategory(category: string): TrendingTopic[] {
    const allTopics = getStaticTrendingTopics();
    return allTopics.filter(t => t.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get available categories
 */
export function getCategories(): string[] {
    const allTopics = getStaticTrendingTopics();
    const categories = new Set(allTopics.map(t => t.category));
    return Array.from(categories);
}

/**
 * Clear topics cache (useful for testing)
 */
export function clearTopicsCache(): void {
    topicCache = null;
    console.log('🗑️ Topics cache cleared');
}
