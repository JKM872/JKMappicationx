/**
 * 🚀 Publishing Service - Auto-post to Twitter, Reddit, Dev.to, Threads
 * Comprehensive multi-platform publishing with OAuth integrations
 */

import axios from 'axios';
import crypto from 'crypto';
import { PlannedPost } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  postUrl?: string;
  error?: string;
  details?: any;
}

export interface MultiPublishResult {
  overall: boolean;
  results: PublishResult[];
  publishedCount: number;
  failedCount: number;
}

export interface PlatformCredentials {
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
  reddit?: {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    userAgent: string;
  };
  devto?: {
    apiKey: string;
  };
  threads?: {
    accessToken: string;
    userId: string;
  };
}

// ============================================================================
// CREDENTIALS MANAGEMENT
// ============================================================================

function getCredentials(): PlatformCredentials {
  return {
    twitter: process.env.TWITTER_API_KEY ? {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
    } : undefined,
    reddit: process.env.REDDIT_CLIENT_ID ? {
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
      username: process.env.REDDIT_USERNAME || '',
      password: process.env.REDDIT_PASSWORD || '',
      userAgent: 'ViralContentHunter/1.0'
    } : undefined,
    devto: process.env.DEVTO_API_KEY ? {
      apiKey: process.env.DEVTO_API_KEY
    } : undefined,
    threads: process.env.THREADS_ACCESS_TOKEN ? {
      accessToken: process.env.THREADS_ACCESS_TOKEN,
      userId: process.env.THREADS_USER_ID || ''
    } : undefined
  };
}

// ============================================================================
// TWITTER/X PUBLISHING
// ============================================================================

/**
 * Generate OAuth 1.0a signature for Twitter API
 */
function generateTwitterOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&');

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  return crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');
}

/**
 * Post to Twitter/X using OAuth 1.0a
 */
async function publishToTwitter(content: string, hashtags?: string[]): Promise<PublishResult> {
  const creds = getCredentials().twitter;
  
  if (!creds || !creds.apiKey || !creds.accessToken) {
    return {
      success: false,
      platform: 'Twitter',
      error: 'Twitter credentials not configured. Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET'
    };
  }

  try {
    // Prepare tweet text with hashtags
    let tweetText = content;
    if (hashtags && hashtags.length > 0) {
      const hashtagText = hashtags.slice(0, 5).join(' ');
      // Ensure we don't exceed 280 characters
      const maxContentLength = 280 - hashtagText.length - 2;
      if (tweetText.length > maxContentLength) {
        tweetText = tweetText.substring(0, maxContentLength - 3) + '...';
      }
      tweetText = `${tweetText}\n\n${hashtagText}`;
    }

    // Twitter API v2 endpoint
    const url = 'https://api.twitter.com/2/tweets';
    
    // OAuth 1.0a parameters
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: creds.apiKey,
      oauth_token: creds.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0'
    };

    // Generate signature
    const signature = generateTwitterOAuthSignature(
      'POST',
      url,
      oauthParams,
      creds.apiSecret,
      creds.accessTokenSecret
    );
    oauthParams.oauth_signature = signature;

    // Build Authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    const response = await axios.post(url, 
      { text: tweetText },
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.data?.data?.id) {
      const tweetId = response.data.data.id;
      console.log(`✅ Twitter: Published tweet ${tweetId}`);
      return {
        success: true,
        platform: 'Twitter',
        postId: tweetId,
        postUrl: `https://twitter.com/i/web/status/${tweetId}`
      };
    }

    return {
      success: false,
      platform: 'Twitter',
      error: 'Unexpected response from Twitter API',
      details: response.data
    };

  } catch (error: any) {
    console.error('❌ Twitter publish error:', error.response?.data || error.message);
    return {
      success: false,
      platform: 'Twitter',
      error: error.response?.data?.detail || error.message,
      details: error.response?.data
    };
  }
}

// ============================================================================
// REDDIT PUBLISHING
// ============================================================================

let redditAccessToken: string | null = null;
let redditTokenExpiry: number = 0;

/**
 * Get Reddit OAuth token
 */
async function getRedditToken(): Promise<string | null> {
  const creds = getCredentials().reddit;
  if (!creds) return null;

  // Return cached token if still valid
  if (redditAccessToken && Date.now() < redditTokenExpiry) {
    return redditAccessToken;
  }

  try {
    const auth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
    
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      `grant_type=password&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': creds.userAgent
        },
        timeout: 10000
      }
    );

    if (response.data?.access_token) {
      redditAccessToken = response.data.access_token;
      redditTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
      console.log('🔐 Reddit: Obtained access token');
      return redditAccessToken;
    }

    return null;
  } catch (error: any) {
    console.error('❌ Reddit auth error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Post to Reddit
 */
async function publishToReddit(
  content: string, 
  options?: { 
    subreddit?: string; 
    title?: string;
    flair?: string;
  }
): Promise<PublishResult> {
  const creds = getCredentials().reddit;
  
  if (!creds) {
    return {
      success: false,
      platform: 'Reddit',
      error: 'Reddit credentials not configured. Set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD'
    };
  }

  const token = await getRedditToken();
  if (!token) {
    return {
      success: false,
      platform: 'Reddit',
      error: 'Failed to authenticate with Reddit'
    };
  }

  try {
    const subreddit = options?.subreddit || 'test'; // Default to test subreddit
    const title = options?.title || content.substring(0, 100);

    const response = await axios.post(
      'https://oauth.reddit.com/api/submit',
      new URLSearchParams({
        sr: subreddit,
        kind: 'self',
        title: title,
        text: content,
        api_type: 'json'
      }),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': creds.userAgent,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      }
    );

    const data = response.data?.json?.data;
    if (data?.name) {
      const postId = data.name;
      const postUrl = data.url || `https://reddit.com${data.permalink}`;
      console.log(`✅ Reddit: Published to r/${subreddit}`);
      return {
        success: true,
        platform: 'Reddit',
        postId,
        postUrl
      };
    }

    const errors = response.data?.json?.errors;
    if (errors && errors.length > 0) {
      return {
        success: false,
        platform: 'Reddit',
        error: errors.map((e: string[]) => e.join(': ')).join(', '),
        details: response.data
      };
    }

    return {
      success: false,
      platform: 'Reddit',
      error: 'Unexpected response from Reddit API',
      details: response.data
    };

  } catch (error: any) {
    console.error('❌ Reddit publish error:', error.response?.data || error.message);
    return {
      success: false,
      platform: 'Reddit',
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    };
  }
}

// ============================================================================
// DEV.TO PUBLISHING
// ============================================================================

/**
 * Post to Dev.to
 */
async function publishToDevTo(
  content: string,
  options?: {
    title?: string;
    tags?: string[];
    series?: string;
    published?: boolean;
  }
): Promise<PublishResult> {
  const creds = getCredentials().devto;
  
  if (!creds) {
    return {
      success: false,
      platform: 'Dev.to',
      error: 'Dev.to API key not configured. Set DEVTO_API_KEY'
    };
  }

  try {
    // Extract title from content or use provided
    let title = options?.title;
    if (!title) {
      // Try to extract title from first line if it looks like a heading
      const firstLine = content.split('\n')[0];
      if (firstLine.startsWith('#')) {
        title = firstLine.replace(/^#+\s*/, '').trim();
        content = content.split('\n').slice(1).join('\n').trim();
      } else {
        title = firstLine.substring(0, 100);
      }
    }

    // Prepare tags (Dev.to allows max 4 tags)
    const tags = options?.tags?.slice(0, 4).map(t => 
      t.replace('#', '').toLowerCase().replace(/[^a-z0-9]/g, '')
    ) || [];

    const response = await axios.post(
      'https://dev.to/api/articles',
      {
        article: {
          title,
          body_markdown: content,
          published: options?.published ?? false,
          tags,
          series: options?.series
        }
      },
      {
        headers: {
          'api-key': creds.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.data?.id) {
      console.log(`✅ Dev.to: Published article ${response.data.id}`);
      return {
        success: true,
        platform: 'Dev.to',
        postId: response.data.id.toString(),
        postUrl: response.data.url
      };
    }

    return {
      success: false,
      platform: 'Dev.to',
      error: 'Unexpected response from Dev.to API',
      details: response.data
    };

  } catch (error: any) {
    console.error('❌ Dev.to publish error:', error.response?.data || error.message);
    return {
      success: false,
      platform: 'Dev.to',
      error: error.response?.data?.error || error.message,
      details: error.response?.data
    };
  }
}

// ============================================================================
// THREADS PUBLISHING (Meta API)
// ============================================================================

/**
 * Post to Threads (via Meta/Instagram API)
 */
async function publishToThreads(content: string): Promise<PublishResult> {
  const creds = getCredentials().threads;
  
  if (!creds || !creds.accessToken) {
    return {
      success: false,
      platform: 'Threads',
      error: 'Threads credentials not configured. Set THREADS_ACCESS_TOKEN and THREADS_USER_ID'
    };
  }

  try {
    // Step 1: Create a media container
    const createResponse = await axios.post(
      `https://graph.threads.net/v1.0/${creds.userId}/threads`,
      null,
      {
        params: {
          media_type: 'TEXT',
          text: content.substring(0, 500), // Threads has 500 char limit
          access_token: creds.accessToken
        },
        timeout: 15000
      }
    );

    const containerId = createResponse.data?.id;
    if (!containerId) {
      return {
        success: false,
        platform: 'Threads',
        error: 'Failed to create Threads container',
        details: createResponse.data
      };
    }

    // Step 2: Publish the container
    const publishResponse = await axios.post(
      `https://graph.threads.net/v1.0/${creds.userId}/threads_publish`,
      null,
      {
        params: {
          creation_id: containerId,
          access_token: creds.accessToken
        },
        timeout: 15000
      }
    );

    if (publishResponse.data?.id) {
      const postId = publishResponse.data.id;
      console.log(`✅ Threads: Published post ${postId}`);
      return {
        success: true,
        platform: 'Threads',
        postId,
        postUrl: `https://www.threads.net/post/${postId}`
      };
    }

    return {
      success: false,
      platform: 'Threads',
      error: 'Unexpected response from Threads API',
      details: publishResponse.data
    };

  } catch (error: any) {
    console.error('❌ Threads publish error:', error.response?.data || error.message);
    return {
      success: false,
      platform: 'Threads',
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data
    };
  }
}

// ============================================================================
// UNIFIED PUBLISHING
// ============================================================================

/**
 * Publish to a single platform
 */
export async function publishToPlatform(
  platform: string,
  content: string,
  options?: {
    hashtags?: string[];
    title?: string;
    subreddit?: string;
    tags?: string[];
  }
): Promise<PublishResult> {
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return publishToTwitter(content, options?.hashtags);
    
    case 'reddit':
      return publishToReddit(content, {
        title: options?.title,
        subreddit: options?.subreddit
      });
    
    case 'dev.to':
    case 'devto':
      return publishToDevTo(content, {
        title: options?.title,
        tags: options?.tags || options?.hashtags
      });
    
    case 'threads':
      return publishToThreads(content);
    
    default:
      return {
        success: false,
        platform,
        error: `Unsupported platform: ${platform}`
      };
  }
}

/**
 * Publish to multiple platforms
 */
export async function publishToAllPlatforms(
  post: PlannedPost,
  options?: {
    subreddit?: string;
    devtoPublished?: boolean;
  }
): Promise<MultiPublishResult> {
  const platforms = post.platform === 'all' 
    ? ['Twitter', 'Reddit', 'Dev.to', 'Threads']
    : [post.platform];

  const results: PublishResult[] = [];
  
  for (const platform of platforms) {
    const result = await publishToPlatform(platform, post.content, {
      hashtags: post.hashtags,
      title: post.original_content?.substring(0, 100),
      subreddit: options?.subreddit,
      tags: post.hashtags
    });
    results.push(result);
    
    // Small delay between platforms to avoid rate limiting
    if (platforms.length > 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const publishedCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  return {
    overall: publishedCount > 0,
    results,
    publishedCount,
    failedCount
  };
}

/**
 * Check which platforms have valid credentials configured
 */
export function getConfiguredPlatforms(): { platform: string; configured: boolean; missing?: string[] }[] {
  const creds = getCredentials();
  
  return [
    {
      platform: 'Twitter',
      configured: !!(creds.twitter?.apiKey && creds.twitter?.accessToken),
      missing: !creds.twitter ? ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_TOKEN_SECRET'] : undefined
    },
    {
      platform: 'Reddit',
      configured: !!(creds.reddit?.clientId && creds.reddit?.username),
      missing: !creds.reddit ? ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USERNAME', 'REDDIT_PASSWORD'] : undefined
    },
    {
      platform: 'Dev.to',
      configured: !!creds.devto?.apiKey,
      missing: !creds.devto ? ['DEVTO_API_KEY'] : undefined
    },
    {
      platform: 'Threads',
      configured: !!(creds.threads?.accessToken && creds.threads?.userId),
      missing: !creds.threads ? ['THREADS_ACCESS_TOKEN', 'THREADS_USER_ID'] : undefined
    }
  ];
}

/**
 * Validate content for platform-specific requirements
 */
export function validateContentForPlatform(
  content: string, 
  platform: string
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      if (content.length > 280) {
        errors.push(`Content exceeds Twitter's 280 character limit (${content.length} chars)`);
      }
      if (content.length > 250) {
        warnings.push('Consider leaving room for hashtags');
      }
      break;
    
    case 'threads':
      if (content.length > 500) {
        errors.push(`Content exceeds Threads' 500 character limit (${content.length} chars)`);
      }
      break;
    
    case 'reddit':
      if (!content.trim()) {
        errors.push('Reddit posts require content');
      }
      if (content.length < 50) {
        warnings.push('Reddit posts perform better with more detailed content');
      }
      break;
    
    case 'dev.to':
    case 'devto':
      if (content.length < 100) {
        warnings.push('Dev.to articles perform better with substantial content');
      }
      if (!content.includes('#') && !content.includes('```')) {
        warnings.push('Consider adding code snippets or technical details for Dev.to');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
