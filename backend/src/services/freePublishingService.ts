import axios from 'axios';

/**
 * 🆓 FREE Publishing Service - No API Keys Required!
 * Uses free public APIs to publish content across platforms
 */

interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  postUrl?: string;
  error?: string;
}

// ============================================================================
// 📝 TELEGRAPH (Telegram's Free Publishing Platform)
// No API key needed! Creates instant articles
// ============================================================================
export async function publishToTelegraph(
  title: string,
  content: string,
  authorName: string = 'Viral Content Hunter'
): Promise<PublishResult> {
  try {
    // Step 1: Create account (or use existing token from env)
    let accessToken = process.env.TELEGRAPH_TOKEN;
    
    if (!accessToken) {
      const accountResponse = await axios.post('https://api.telegra.ph/createAccount', {
        short_name: authorName.substring(0, 32),
        author_name: authorName
      });
      
      if (accountResponse.data.ok) {
        accessToken = accountResponse.data.result.access_token;
        console.log('📝 Telegraph: Created new account');
      } else {
        return { success: false, platform: 'telegraph', error: 'Failed to create account' };
      }
    }

    // Step 2: Create page/article
    // Telegraph uses Node DOM format, convert content to simple format
    const contentNodes = [
      { tag: 'p', children: [content] }
    ];

    const pageResponse = await axios.post('https://api.telegra.ph/createPage', {
      access_token: accessToken,
      title: title.substring(0, 256),
      author_name: authorName,
      content: JSON.stringify(contentNodes),
      return_content: false
    });

    if (pageResponse.data.ok) {
      const result = pageResponse.data.result;
      console.log(`✅ Telegraph: Published "${title}"`);
      return {
        success: true,
        platform: 'telegraph',
        postId: result.path,
        postUrl: result.url
      };
    }

    return { success: false, platform: 'telegraph', error: pageResponse.data.error };
  } catch (error: any) {
    console.error('❌ Telegraph error:', error.message);
    return { success: false, platform: 'telegraph', error: error.message };
  }
}

// ============================================================================
// 🦋 BLUESKY (Public API - No Auth for posting via AT Protocol)
// Requires account but FREE to create
// ============================================================================
export async function publishToBluesky(
  content: string,
  handle?: string,
  password?: string
): Promise<PublishResult> {
  try {
    const bskyHandle = handle || process.env.BLUESKY_HANDLE;
    const bskyPassword = password || process.env.BLUESKY_APP_PASSWORD;

    if (!bskyHandle || !bskyPassword) {
      return { 
        success: false, 
        platform: 'bluesky', 
        error: 'Set BLUESKY_HANDLE and BLUESKY_APP_PASSWORD (free account at bsky.app)' 
      };
    }

    // Step 1: Create session
    const sessionResponse = await axios.post('https://bsky.social/xrpc/com.atproto.server.createSession', {
      identifier: bskyHandle,
      password: bskyPassword
    });

    const { accessJwt, did } = sessionResponse.data;

    // Step 2: Create post
    const now = new Date().toISOString();
    const postResponse = await axios.post(
      'https://bsky.social/xrpc/com.atproto.repo.createRecord',
      {
        repo: did,
        collection: 'app.bsky.feed.post',
        record: {
          text: content.substring(0, 300), // Bluesky limit
          createdAt: now,
          $type: 'app.bsky.feed.post'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessJwt}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const postUri = postResponse.data.uri;
    const postId = postUri.split('/').pop();
    
    console.log(`✅ Bluesky: Posted successfully`);
    return {
      success: true,
      platform: 'bluesky',
      postId: postId,
      postUrl: `https://bsky.app/profile/${bskyHandle}/post/${postId}`
    };
  } catch (error: any) {
    console.error('❌ Bluesky error:', error.response?.data || error.message);
    return { success: false, platform: 'bluesky', error: error.message };
  }
}

// ============================================================================
// 🐘 MASTODON (Public API - Many free instances)
// Requires account on any instance (free)
// ============================================================================
export async function publishToMastodon(
  content: string,
  instanceUrl?: string,
  accessToken?: string
): Promise<PublishResult> {
  try {
    const instance = instanceUrl || process.env.MASTODON_INSTANCE || 'https://mastodon.social';
    const token = accessToken || process.env.MASTODON_ACCESS_TOKEN;

    if (!token) {
      return {
        success: false,
        platform: 'mastodon',
        error: 'Set MASTODON_ACCESS_TOKEN (create app at your instance settings)'
      };
    }

    const response = await axios.post(
      `${instance}/api/v1/statuses`,
      {
        status: content.substring(0, 500), // Most instances allow 500 chars
        visibility: 'public'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Mastodon: Posted to ${instance}`);
    return {
      success: true,
      platform: 'mastodon',
      postId: response.data.id,
      postUrl: response.data.url
    };
  } catch (error: any) {
    console.error('❌ Mastodon error:', error.response?.data || error.message);
    return { success: false, platform: 'mastodon', error: error.message };
  }
}

// ============================================================================
// 📋 PASTEBIN (Free text publishing - no auth for basic)
// Creates shareable text links
// ============================================================================
export async function publishToPastebin(
  content: string,
  title: string = 'Viral Content'
): Promise<PublishResult> {
  try {
    const apiKey = process.env.PASTEBIN_API_KEY; // Free to get at pastebin.com
    
    if (!apiKey) {
      // Use alternative: dpaste.org (completely free, no key needed!)
      return await publishToDpaste(content, title);
    }

    const response = await axios.post(
      'https://pastebin.com/api/api_post.php',
      new URLSearchParams({
        api_dev_key: apiKey,
        api_option: 'paste',
        api_paste_code: content,
        api_paste_name: title,
        api_paste_private: '0', // Public
        api_paste_expire_date: 'N' // Never expire
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    if (response.data.startsWith('https://')) {
      console.log(`✅ Pastebin: Created paste`);
      return {
        success: true,
        platform: 'pastebin',
        postUrl: response.data
      };
    }

    return { success: false, platform: 'pastebin', error: response.data };
  } catch (error: any) {
    return { success: false, platform: 'pastebin', error: error.message };
  }
}

// ============================================================================
// 📝 DPASTE (Completely free, no API key needed!)
// ============================================================================
async function publishToDpaste(content: string, title: string): Promise<PublishResult> {
  try {
    const response = await axios.post(
      'https://dpaste.org/api/',
      new URLSearchParams({
        content: `${title}\n\n${content}`,
        format: 'url',
        expires: '31536000' // 1 year in seconds
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    console.log(`✅ Dpaste: Created paste`);
    return {
      success: true,
      platform: 'dpaste',
      postUrl: response.data.trim()
    };
  } catch (error: any) {
    return { success: false, platform: 'dpaste', error: error.message };
  }
}

// ============================================================================
// 🔗 GitHub Gist (Free with GitHub account)
// ============================================================================
export async function publishToGist(
  content: string,
  filename: string = 'viral-content.md',
  description: string = 'Viral Content'
): Promise<PublishResult> {
  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return {
        success: false,
        platform: 'gist',
        error: 'Set GITHUB_TOKEN (free at github.com/settings/tokens)'
      };
    }

    const response = await axios.post(
      'https://api.github.com/gists',
      {
        description: description,
        public: true,
        files: {
          [filename]: { content: content }
        }
      },
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ViralContentHunter'
        }
      }
    );

    console.log(`✅ GitHub Gist: Created`);
    return {
      success: true,
      platform: 'gist',
      postId: response.data.id,
      postUrl: response.data.html_url
    };
  } catch (error: any) {
    return { success: false, platform: 'gist', error: error.message };
  }
}

// ============================================================================
// 🌐 HASHNODE (Free developer blogging platform)
// ============================================================================
export async function publishToHashnode(
  title: string,
  content: string,
  tags: string[] = ['programming', 'tech']
): Promise<PublishResult> {
  try {
    const apiKey = process.env.HASHNODE_API_KEY;
    const publicationId = process.env.HASHNODE_PUBLICATION_ID;

    if (!apiKey || !publicationId) {
      return {
        success: false,
        platform: 'hashnode',
        error: 'Set HASHNODE_API_KEY and HASHNODE_PUBLICATION_ID (free at hashnode.com)'
      };
    }

    const mutation = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            url
          }
        }
      }
    `;

    const response = await axios.post(
      'https://gql.hashnode.com',
      {
        query: mutation,
        variables: {
          input: {
            title: title,
            contentMarkdown: content,
            publicationId: publicationId,
            tags: tags.map(t => ({ slug: t.toLowerCase(), name: t }))
          }
        }
      },
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const post = response.data?.data?.publishPost?.post;
    if (post) {
      console.log(`✅ Hashnode: Published article`);
      return {
        success: true,
        platform: 'hashnode',
        postId: post.id,
        postUrl: post.url
      };
    }

    return { success: false, platform: 'hashnode', error: 'Publication failed' };
  } catch (error: any) {
    return { success: false, platform: 'hashnode', error: error.message };
  }
}

// ============================================================================
// 🎯 UNIFIED PUBLISH - Try all free platforms
// ============================================================================
export async function publishToFreeplatforms(
  content: string,
  title: string = 'Viral Content',
  options: {
    platforms?: ('telegraph' | 'bluesky' | 'mastodon' | 'dpaste' | 'gist' | 'hashnode')[];
    authorName?: string;
  } = {}
): Promise<PublishResult[]> {
  const { platforms = ['telegraph', 'dpaste'], authorName = 'Viral Content Hunter' } = options;
  const results: PublishResult[] = [];

  for (const platform of platforms) {
    let result: PublishResult;
    
    switch (platform) {
      case 'telegraph':
        result = await publishToTelegraph(title, content, authorName);
        break;
      case 'bluesky':
        result = await publishToBluesky(content);
        break;
      case 'mastodon':
        result = await publishToMastodon(content);
        break;
      case 'dpaste':
        result = await publishToDpaste(content, title);
        break;
      case 'gist':
        result = await publishToGist(content, `${title.replace(/\s+/g, '-')}.md`, title);
        break;
      case 'hashnode':
        result = await publishToHashnode(title, content);
        break;
      default:
        result = { success: false, platform, error: 'Unknown platform' };
    }
    
    results.push(result);
  }

  return results;
}

// ============================================================================
// 📊 Check which free platforms are configured
// ============================================================================
export function getAvailableFreePlatforms(): {
  platform: string;
  available: boolean;
  note: string;
}[] {
  return [
    {
      platform: 'telegraph',
      available: true, // Always available - no auth needed!
      note: '✅ Zawsze dostępny - bez klucza API!'
    },
    {
      platform: 'dpaste',
      available: true, // Always available - no auth needed!
      note: '✅ Zawsze dostępny - bez klucza API!'
    },
    {
      platform: 'bluesky',
      available: !!(process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD),
      note: process.env.BLUESKY_HANDLE 
        ? '✅ Skonfigurowany' 
        : '⚠️ Ustaw BLUESKY_HANDLE i BLUESKY_APP_PASSWORD (darmowe konto na bsky.app)'
    },
    {
      platform: 'mastodon',
      available: !!process.env.MASTODON_ACCESS_TOKEN,
      note: process.env.MASTODON_ACCESS_TOKEN 
        ? '✅ Skonfigurowany' 
        : '⚠️ Ustaw MASTODON_ACCESS_TOKEN (darmowe konto na mastodon.social)'
    },
    {
      platform: 'gist',
      available: !!process.env.GITHUB_TOKEN,
      note: process.env.GITHUB_TOKEN 
        ? '✅ Skonfigurowany' 
        : '⚠️ Ustaw GITHUB_TOKEN (darmowe na github.com/settings/tokens)'
    },
    {
      platform: 'hashnode',
      available: !!(process.env.HASHNODE_API_KEY && process.env.HASHNODE_PUBLICATION_ID),
      note: process.env.HASHNODE_API_KEY 
        ? '✅ Skonfigurowany' 
        : '⚠️ Ustaw HASHNODE_API_KEY (darmowe konto na hashnode.com)'
    }
  ];
}

export default {
  publishToTelegraph,
  publishToBluesky,
  publishToMastodon,
  publishToPastebin,
  publishToGist,
  publishToHashnode,
  publishToFreeplatforms,
  getAvailableFreePlatforms
};
