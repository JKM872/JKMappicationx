/**
 * 🔍 Competitor Intelligence Service
 * Track and analyze competitor accounts
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Competitor {
    id: string;
    handle: string;
    platform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads';
    name?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    avgEngagement: number;
    topTopics: string[];
    addedAt: Date;
}

export interface CompetitorPost {
    id: string;
    competitorId: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    postedAt: Date;
    topics: string[];
}

export interface CompetitorAnalysis {
    competitor: Competitor;
    recentPosts: CompetitorPost[];
    contentStrategy: {
        topPerformingTopics: Array<{ topic: string; avgEngagement: number }>;
        postingFrequency: string;
        bestPostingTimes: string[];
        avgPostLength: number;
        emojiUsage: 'low' | 'medium' | 'high';
        hashtagUsage: 'low' | 'medium' | 'high';
    };
    comparison: {
        followersGrowth: number;
        engagementDiff: number;
        strengthsVsYou: string[];
        opportunitiesForYou: string[];
    };
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_COMPETITORS: Competitor[] = [
    {
        id: '1',
        handle: '@sahaborami',
        platform: 'Twitter',
        name: 'Sahil Lavingia',
        bio: 'Founder of Gumroad. Angel investor.',
        followersCount: 456000,
        followingCount: 1200,
        postsCount: 12500,
        avgEngagement: 3.2,
        topTopics: ['startups', 'indie hacking', 'product'],
        addedAt: new Date('2024-01-15')
    },
    {
        id: '2',
        handle: '@levelsio',
        platform: 'Twitter',
        name: 'Pieter Levels',
        bio: 'Making #nomadlist & #remoteok',
        followersCount: 520000,
        followingCount: 890,
        postsCount: 34200,
        avgEngagement: 4.1,
        topTopics: ['indie hacker', 'nomad', 'AI', 'bootstrapping'],
        addedAt: new Date('2024-02-10')
    },
    {
        id: '3',
        handle: '@thedankoe',
        platform: 'Twitter',
        name: 'Dan Koe',
        bio: 'Writing about the future of work and education',
        followersCount: 890000,
        followingCount: 450,
        postsCount: 8900,
        avgEngagement: 5.8,
        topTopics: ['personal brand', 'writing', 'philosophy', 'creator economy'],
        addedAt: new Date('2024-03-05')
    }
];

const MOCK_POSTS: CompetitorPost[] = [
    {
        id: 'p1',
        competitorId: '1',
        content: 'The best time to start was yesterday. The second best time is now.',
        likes: 4500,
        comments: 234,
        shares: 890,
        engagementRate: 4.2,
        postedAt: new Date('2024-12-14'),
        topics: ['motivation', 'startups']
    },
    {
        id: 'p2',
        competitorId: '2',
        content: 'I just launched a new AI tool in 24 hours. Here\'s how: 🧵',
        likes: 8900,
        comments: 567,
        shares: 1230,
        engagementRate: 6.8,
        postedAt: new Date('2024-12-13'),
        topics: ['AI', 'building in public', 'indie hacker']
    },
    {
        id: 'p3',
        competitorId: '3',
        content: 'Unpopular opinion: Working 80 hours a week is not a flex. It\'s a management problem.',
        likes: 12300,
        comments: 890,
        shares: 2100,
        engagementRate: 8.5,
        postedAt: new Date('2024-12-12'),
        topics: ['work-life balance', 'productivity']
    }
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Get all tracked competitors
 */
export async function getCompetitors(): Promise<Competitor[]> {
    // In production, fetch from database
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_COMPETITORS;
}

/**
 * Get competitor by ID
 */
export async function getCompetitorById(id: string): Promise<Competitor | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_COMPETITORS.find(c => c.id === id) || null;
}

/**
 * Add a new competitor to track
 */
export async function addCompetitor(handle: string, platform: string): Promise<Competitor> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newCompetitor: Competitor = {
        id: `comp-${Date.now()}`,
        handle,
        platform: platform as any,
        followersCount: Math.floor(Math.random() * 100000) + 1000,
        followingCount: Math.floor(Math.random() * 1000) + 100,
        postsCount: Math.floor(Math.random() * 5000) + 100,
        avgEngagement: Math.random() * 5 + 1,
        topTopics: ['tech', 'AI', 'startups'],
        addedAt: new Date()
    };

    MOCK_COMPETITORS.push(newCompetitor);
    return newCompetitor;
}

/**
 * Remove a competitor
 */
export async function removeCompetitor(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = MOCK_COMPETITORS.findIndex(c => c.id === id);
    if (index > -1) {
        MOCK_COMPETITORS.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Get competitor's recent posts
 */
export async function getCompetitorPosts(competitorId: string): Promise<CompetitorPost[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_POSTS.filter(p => p.competitorId === competitorId);
}

/**
 * Analyze a competitor's strategy
 */
export async function analyzeCompetitor(competitorId: string): Promise<CompetitorAnalysis | null> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const competitor = await getCompetitorById(competitorId);
    if (!competitor) return null;

    const posts = await getCompetitorPosts(competitorId);

    return {
        competitor,
        recentPosts: posts,
        contentStrategy: {
            topPerformingTopics: competitor.topTopics.map(topic => ({
                topic,
                avgEngagement: Math.random() * 5 + 2
            })),
            postingFrequency: '3-5 posts/day',
            bestPostingTimes: ['8:00 AM EST', '12:00 PM EST', '6:00 PM EST'],
            avgPostLength: 180,
            emojiUsage: 'medium',
            hashtagUsage: 'low'
        },
        comparison: {
            followersGrowth: Math.floor(Math.random() * 20) - 5,
            engagementDiff: Math.random() * 2 - 1,
            strengthsVsYou: [
                'Higher posting frequency',
                'More replies to comments',
                'Consistent thread format'
            ],
            opportunitiesForYou: [
                'They don\'t cover AI tools',
                'Less active on weekends',
                'No video content'
            ]
        }
    };
}

/**
 * Get comparison between competitors
 */
export async function compareCompetitors(ids: string[]): Promise<{
    competitors: Competitor[];
    metrics: Array<{
        name: string;
        values: number[];
    }>;
}> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const competitors = MOCK_COMPETITORS.filter(c => ids.includes(c.id));

    return {
        competitors,
        metrics: [
            { name: 'Followers', values: competitors.map(c => c.followersCount) },
            { name: 'Posts', values: competitors.map(c => c.postsCount) },
            { name: 'Avg Engagement', values: competitors.map(c => c.avgEngagement) }
        ]
    };
}
