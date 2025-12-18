/**
 * 🐦 Twitter/X Simple Scraper - No Auth Required
 * Uses Twitter's public endpoints that still work
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SimpleTwitterPost {
    id: string;
    platform: 'Twitter';
    author: string;
    handle: string;
    title: string;
    content: string;
    url: string;
    likes: number;
    retweets: number;
    replies: number;
    timestamp: string;
    image?: string;
    score: number;
    dataSource: 'live' | 'estimated';
}

const USER_AGENTS = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
];

function getRandomUA(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Try to get a guest token from Twitter
 */
async function getGuestToken(): Promise<string | null> {
    try {
        const response = await axios.post(
            'https://api.twitter.com/1.1/guest/activate.json',
            {},
            {
                headers: {
                    'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'User-Agent': getRandomUA()
                },
                timeout: 10000
            }
        );
        return response.data?.guest_token || null;
    } catch (err) {
        console.warn('⚠️ Could not get guest token:', (err as Error).message);
        return null;
    }
}

/**
 * Search tweets using Twitter API v1.1 with guest token
 */
async function searchWithGuestToken(query: string, limit: number): Promise<SimpleTwitterPost[]> {
    const guestToken = await getGuestToken();
    if (!guestToken) return [];

    try {
        const response = await axios.get(
            `https://api.twitter.com/1.1/search/tweets.json`,
            {
                params: {
                    q: query,
                    count: Math.min(limit, 100),
                    result_type: 'popular',
                    tweet_mode: 'extended'
                },
                headers: {
                    'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'x-guest-token': guestToken,
                    'User-Agent': getRandomUA()
                },
                timeout: 15000
            }
        );

        const tweets = response.data?.statuses || [];
        return tweets.map((tweet: any, idx: number) => ({
            id: tweet.id_str || `twitter-${Date.now()}-${idx}`,
            platform: 'Twitter' as const,
            author: tweet.user?.name || 'Twitter User',
            handle: `@${tweet.user?.screen_name || 'user'}`,
            title: (tweet.full_text || tweet.text || '').substring(0, 100),
            content: tweet.full_text || tweet.text || '',
            url: `https://twitter.com/${tweet.user?.screen_name}/status/${tweet.id_str}`,
            likes: tweet.favorite_count || 0,
            retweets: tweet.retweet_count || 0,
            replies: tweet.reply_count || 0,
            timestamp: tweet.created_at || new Date().toISOString(),
            image: tweet.entities?.media?.[0]?.media_url_https,
            score: (tweet.favorite_count || 0) + (tweet.retweet_count || 0) * 1.5,
            dataSource: 'live' as const
        }));
    } catch (err) {
        console.warn('⚠️ Guest token search failed:', (err as Error).message);
        return [];
    }
}

/**
 * Try Twitter's Publish/Embed endpoint
 */
async function searchViaPublishEndpoint(query: string, limit: number): Promise<SimpleTwitterPost[]> {
    try {
        // Use Twitter publish endpoint for embedded content
        const response = await axios.get(
            `https://publish.twitter.com/oembed`,
            {
                params: {
                    url: `https://twitter.com/search?q=${encodeURIComponent(query)}&f=live`,
                    maxwidth: 550
                },
                headers: { 'User-Agent': getRandomUA() },
                timeout: 10000
            }
        );

        if (response.data?.html) {
            const $ = cheerio.load(response.data.html);
            const posts: SimpleTwitterPost[] = [];

            $('blockquote').each((idx, elem) => {
                if (posts.length >= limit) return false;
                const content = $(elem).text().trim();
                if (content.length > 20) {
                    posts.push({
                        id: `embed-${Date.now()}-${idx}`,
                        platform: 'Twitter',
                        author: 'Twitter User',
                        handle: '@user',
                        title: content.substring(0, 100),
                        content: content,
                        url: `https://twitter.com/search?q=${encodeURIComponent(query)}`,
                        likes: 0,
                        retweets: 0,
                        replies: 0,
                        timestamp: new Date().toISOString(),
                        score: 50,
                        dataSource: 'estimated'
                    });
                }
            });

            return posts;
        }
    } catch (err) {
        console.warn('⚠️ Publish endpoint failed:', (err as Error).message);
    }
    return [];
}

/**
 * Scrape via xcancel.com (new working Nitter fork)
 */
async function searchViaXCancel(query: string, limit: number): Promise<SimpleTwitterPost[]> {
    const instances = [
        'https://xcancel.com',
        'https://nitter.poast.org',
        'https://nitter.privacydev.net'
    ];

    for (const instance of instances) {
        try {
            console.log(`🔗 Trying ${instance}...`);
            const response = await axios.get(
                `${instance}/search?q=${encodeURIComponent(query)}&f=tweets`,
                {
                    headers: {
                        'User-Agent': getRandomUA(),
                        'Accept': 'text/html,application/xhtml+xml',
                        'Accept-Language': 'en-US,en;q=0.9'
                    },
                    timeout: 15000
                }
            );

            if (response.status === 200 && response.data) {
                const $ = cheerio.load(response.data);
                const posts: SimpleTwitterPost[] = [];

                $('.timeline-item').each((idx, elem) => {
                    if (posts.length >= limit) return false;

                    const $el = $(elem);
                    const content = $el.find('.tweet-content').text().trim();
                    const author = $el.find('.fullname').text().trim() || 'User';
                    const handle = $el.find('.username').text().trim() || '@user';
                    const link = $el.find('.tweet-link').attr('href') || '';

                    // Parse stats
                    const statsText = $el.find('.tweet-stat').text();
                    const likesMatch = statsText.match(/(\d+)\s*like/i);
                    const retweetsMatch = statsText.match(/(\d+)\s*retweet/i);
                    const repliesMatch = statsText.match(/(\d+)\s*repl/i);

                    if (content.length > 15) {
                        posts.push({
                            id: `xcancel-${Date.now()}-${idx}`,
                            platform: 'Twitter',
                            author,
                            handle: handle.startsWith('@') ? handle : `@${handle}`,
                            title: content.substring(0, 100),
                            content,
                            url: link.startsWith('http') ? link : `https://twitter.com${link}`,
                            likes: parseInt(likesMatch?.[1] || '0'),
                            retweets: parseInt(retweetsMatch?.[1] || '0'),
                            replies: parseInt(repliesMatch?.[1] || '0'),
                            timestamp: new Date().toISOString(),
                            score: parseInt(likesMatch?.[1] || '0') + parseInt(retweetsMatch?.[1] || '0') * 1.5,
                            dataSource: 'live'
                        });
                    }
                });

                if (posts.length > 0) {
                    console.log(`✅ ${instance}: Found ${posts.length} tweets`);
                    return posts;
                }
            }
        } catch (err) {
            console.warn(`⚠️ ${instance} failed:`, (err as Error).message);
        }
    }

    return [];
}

/**
 * Main search function with multiple strategies
 */
export async function searchTwitterSimple(query: string, limit: number = 20): Promise<SimpleTwitterPost[]> {
    console.log(`\n🐦 Searching Twitter/X for: "${query}"\n`);

    // Strategy 1: Guest Token API
    console.log('📡 Strategy 1: Guest Token API...');
    const guestPosts = await searchWithGuestToken(query, limit);
    if (guestPosts.length > 0) {
        console.log(`✅ Guest Token: ${guestPosts.length} REAL tweets!`);
        return guestPosts;
    }

    // Strategy 2: XCancel/Nitter forks
    console.log('📡 Strategy 2: XCancel/Nitter...');
    const xCancelPosts = await searchViaXCancel(query, limit);
    if (xCancelPosts.length > 0) {
        return xCancelPosts;
    }

    // Strategy 3: Publish endpoint
    console.log('📡 Strategy 3: Publish endpoint...');
    const publishPosts = await searchViaPublishEndpoint(query, limit);
    if (publishPosts.length > 0) {
        console.log(`✅ Publish: ${publishPosts.length} tweets`);
        return publishPosts;
    }

    console.log('⚠️ All Twitter strategies failed');
    return [];
}

export default { searchTwitterSimple };
