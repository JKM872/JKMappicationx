import axios from 'axios';

/**
 * 🆓 ZERO-AUTH PUBLISHING SERVICE
 * All these APIs work WITHOUT any login, registration, or API keys!
 */

interface PublishResult {
  success: boolean;
  platform: string;
  postUrl?: string;
  error?: string;
  expiresIn?: string;
}

// ============================================================================
// 📝 TELEGRAPH (Telegram) - NO AUTH NEEDED!
// Creates instant web pages, no login required
// ============================================================================
export async function publishToTelegraph(
  title: string,
  content: string,
  authorName: string = 'Viral Content Hunter'
): Promise<PublishResult> {
  try {
    // Create anonymous account (no registration!)
    const accountRes = await axios.get('https://api.telegra.ph/createAccount', {
      params: {
        short_name: authorName.substring(0, 32),
        author_name: authorName
      }
    });

    if (!accountRes.data.ok) {
      return { success: false, platform: 'telegraph', error: 'Account creation failed' };
    }

    const token = accountRes.data.result.access_token;

    // Create page
    const pageRes = await axios.post('https://api.telegra.ph/createPage', {
      access_token: token,
      title: title.substring(0, 256),
      author_name: authorName,
      content: JSON.stringify([{ tag: 'p', children: [content] }]),
      return_content: false
    });

    if (pageRes.data.ok) {
      console.log(`✅ Telegraph: ${pageRes.data.result.url}`);
      return {
        success: true,
        platform: 'telegraph',
        postUrl: pageRes.data.result.url,
        expiresIn: 'Never'
      };
    }

    return { success: false, platform: 'telegraph', error: pageRes.data.error };
  } catch (error: any) {
    return { success: false, platform: 'telegraph', error: error.message };
  }
}

// ============================================================================
// 📋 DPASTE.ORG - NO AUTH, NO LIMITS!
// ============================================================================
export async function publishToDpaste(
  content: string,
  title: string = ''
): Promise<PublishResult> {
  try {
    const fullContent = title ? `# ${title}\n\n${content}` : content;

    const response = await axios.post(
      'https://dpaste.org/api/',
      new URLSearchParams({
        content: fullContent,
        format: 'url',
        expires: '31536000' // 1 year
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const url = response.data.trim();
    console.log(`✅ Dpaste: ${url}`);
    return {
      success: true,
      platform: 'dpaste',
      postUrl: url,
      expiresIn: '1 year'
    };
  } catch (error: any) {
    return { success: false, platform: 'dpaste', error: error.message };
  }
}

// ============================================================================
// 📝 RENTRY.CO - NO AUTH, Markdown support!
// ============================================================================
export async function publishToRentry(
  content: string,
  customUrl?: string
): Promise<PublishResult> {
  try {
    // Get CSRF token first
    const tokenRes = await axios.get('https://rentry.co');
    const csrfMatch = tokenRes.data.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';
    const cookies = tokenRes.headers['set-cookie']?.join('; ') || '';

    const formData = new URLSearchParams({
      csrfmiddlewaretoken: csrfToken,
      text: content,
      url: customUrl || '',
      edit_code: ''
    });

    const response = await axios.post('https://rentry.co/api/new', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'Referer': 'https://rentry.co'
      },
      maxRedirects: 0,
      validateStatus: (s) => s < 400
    });

    if (response.data.url) {
      console.log(`✅ Rentry: ${response.data.url}`);
      return {
        success: true,
        platform: 'rentry',
        postUrl: response.data.url,
        expiresIn: 'Never'
      };
    }

    return { success: false, platform: 'rentry', error: 'Failed to create' };
  } catch (error: any) {
    return { success: false, platform: 'rentry', error: error.message };
  }
}

// ============================================================================
// 📝 PASTE.RS - Ultra simple, NO AUTH!
// ============================================================================
export async function publishToPasteRs(content: string): Promise<PublishResult> {
  try {
    const response = await axios.post('https://paste.rs/', content, {
      headers: { 'Content-Type': 'text/plain' }
    });

    const url = response.data.trim();
    console.log(`✅ Paste.rs: ${url}`);
    return {
      success: true,
      platform: 'paste.rs',
      postUrl: url,
      expiresIn: 'Never'
    };
  } catch (error: any) {
    return { success: false, platform: 'paste.rs', error: error.message };
  }
}

// ============================================================================
// 📝 0x0.ST - File hosting, NO AUTH!
// ============================================================================
export async function publishTo0x0(content: string, filename: string = 'content.txt'): Promise<PublishResult> {
  try {
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', Buffer.from(content), { filename });

    const response = await axios.post('https://0x0.st', form, {
      headers: form.getHeaders()
    });

    const url = response.data.trim();
    console.log(`✅ 0x0.st: ${url}`);
    return {
      success: true,
      platform: '0x0.st',
      postUrl: url,
      expiresIn: '1 year (auto-extended on access)'
    };
  } catch (error: any) {
    return { success: false, platform: '0x0.st', error: error.message };
  }
}

// ============================================================================
// 📝 SPRUNGE.US - Ultra minimal paste, NO AUTH!
// ============================================================================
export async function publishToSprunge(content: string): Promise<PublishResult> {
  try {
    const response = await axios.post(
      'http://sprunge.us',
      new URLSearchParams({ sprunge: content }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const url = response.data.trim();
    console.log(`✅ Sprunge: ${url}`);
    return {
      success: true,
      platform: 'sprunge',
      postUrl: url,
      expiresIn: 'Unknown'
    };
  } catch (error: any) {
    return { success: false, platform: 'sprunge', error: error.message };
  }
}

// ============================================================================
// 📝 HASTEBIN (toptal) - NO AUTH!
// ============================================================================
export async function publishToHastebin(content: string): Promise<PublishResult> {
  try {
    const response = await axios.post('https://hastebin.com/documents', content, {
      headers: { 'Content-Type': 'text/plain' }
    });

    if (response.data.key) {
      const url = `https://hastebin.com/${response.data.key}`;
      console.log(`✅ Hastebin: ${url}`);
      return {
        success: true,
        platform: 'hastebin',
        postUrl: url,
        expiresIn: '30 days'
      };
    }

    return { success: false, platform: 'hastebin', error: 'No key returned' };
  } catch (error: any) {
    return { success: false, platform: 'hastebin', error: error.message };
  }
}

// ============================================================================
// 📝 PASTE.MOZILLA.ORG - NO AUTH!
// ============================================================================
export async function publishToMozillaPaste(content: string, title: string = 'Viral Content'): Promise<PublishResult> {
  try {
    const response = await axios.post(
      'https://paste.mozilla.org/api/',
      new URLSearchParams({
        content: content,
        lexer: 'text',
        format: 'json',
        expires: '2592000' // 30 days
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (response.data.url) {
      console.log(`✅ Mozilla Paste: ${response.data.url}`);
      return {
        success: true,
        platform: 'mozilla-paste',
        postUrl: response.data.url,
        expiresIn: '30 days'
      };
    }

    return { success: false, platform: 'mozilla-paste', error: 'Failed' };
  } catch (error: any) {
    return { success: false, platform: 'mozilla-paste', error: error.message };
  }
}

// ============================================================================
// 📝 TERMBIN - Command-line style, NO AUTH!
// ============================================================================
export async function publishToTermbin(content: string): Promise<PublishResult> {
  try {
    // Termbin uses netcat, but we can use their HTTP endpoint
    const response = await axios.post(
      'https://termbin.com',
      content,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 10000
      }
    );

    const url = response.data.trim();
    if (url.startsWith('http')) {
      console.log(`✅ Termbin: ${url}`);
      return {
        success: true,
        platform: 'termbin',
        postUrl: url,
        expiresIn: '1 month'
      };
    }

    return { success: false, platform: 'termbin', error: 'Invalid response' };
  } catch (error: any) {
    return { success: false, platform: 'termbin', error: error.message };
  }
}

// ============================================================================
// 📝 CATBOX.MOE - File hosting, NO AUTH!
// ============================================================================
export async function publishToCatbox(content: string, filename: string = 'content.txt'): Promise<PublishResult> {
  try {
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', Buffer.from(content), { filename });

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });

    const url = response.data.trim();
    if (url.startsWith('http')) {
      console.log(`✅ Catbox: ${url}`);
      return {
        success: true,
        platform: 'catbox',
        postUrl: url,
        expiresIn: 'Never'
      };
    }

    return { success: false, platform: 'catbox', error: response.data };
  } catch (error: any) {
    return { success: false, platform: 'catbox', error: error.message };
  }
}

// ============================================================================
// 📝 PRIVATEBIN - Encrypted paste, NO AUTH!
// ============================================================================
export async function publishToPrivateBin(content: string): Promise<PublishResult> {
  try {
    // PrivateBin uses client-side encryption, simplified version
    const response = await axios.post(
      'https://privatebin.net/',
      new URLSearchParams({
        data: Buffer.from(content).toString('base64'),
        expire: '1week',
        formatter: 'plaintext',
        burnafterreading: '0',
        opendiscussion: '0'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'JSONHttpRequest'
        }
      }
    );

    if (response.data.url) {
      const url = `https://privatebin.net${response.data.url}`;
      console.log(`✅ PrivateBin: ${url}`);
      return {
        success: true,
        platform: 'privatebin',
        postUrl: url,
        expiresIn: '1 week'
      };
    }

    return { success: false, platform: 'privatebin', error: 'Failed' };
  } catch (error: any) {
    return { success: false, platform: 'privatebin', error: error.message };
  }
}

// ============================================================================
// 🚀 PUBLISH TO ALL NO-AUTH PLATFORMS
// ============================================================================
export async function publishToAllNoAuth(
  content: string,
  title: string = 'Viral Content'
): Promise<{
  results: PublishResult[];
  successful: number;
  failed: number;
  urls: string[];
}> {
  const publishers = [
    () => publishToTelegraph(title, content),
    () => publishToDpaste(content, title),
    () => publishToPasteRs(content),
    () => publishToHastebin(content),
    () => publishToCatbox(content, `${title.replace(/\s+/g, '-')}.md`),
  ];

  const results = await Promise.all(publishers.map(fn => fn().catch(err => ({
    success: false,
    platform: 'unknown',
    error: err.message
  }))));

  const successful = results.filter((r): r is PublishResult => r.success && 'postUrl' in r && !!r.postUrl);

  return {
    results: results as PublishResult[],
    successful: successful.length,
    failed: results.length - successful.length,
    urls: successful.map(r => r.postUrl!).filter(Boolean) as string[]
  };
}

// ============================================================================
// 📊 LIST ALL NO-AUTH PLATFORMS
// ============================================================================
export function getNoAuthPlatforms(): {
  platform: string;
  description: string;
  maxSize: string;
  expiry: string;
  features: string[];
}[] {
  return [
    {
      platform: 'telegraph',
      description: 'Telegram instant articles - profesjonalne strony',
      maxSize: '64KB',
      expiry: 'Nigdy',
      features: ['Markdown', 'Obrazy', 'Formatowanie', 'SEO']
    },
    {
      platform: 'dpaste',
      description: 'Prosty paste z syntax highlighting',
      maxSize: '250KB',
      expiry: '1 rok',
      features: ['Syntax highlighting', 'Raw view']
    },
    {
      platform: 'paste.rs',
      description: 'Ultra minimalistyczny paste',
      maxSize: '1MB',
      expiry: 'Nigdy',
      features: ['Plain text', 'Szybki']
    },
    {
      platform: 'hastebin',
      description: 'Popularny paste z ładnym UI',
      maxSize: '400KB',
      expiry: '30 dni',
      features: ['Syntax highlighting', 'Raw view', 'Duplicate']
    },
    {
      platform: 'catbox',
      description: 'Hosting plików bez limitu',
      maxSize: '200MB',
      expiry: 'Nigdy',
      features: ['Pliki', 'Obrazy', 'Wideo', 'Bezpośredni link']
    },
    {
      platform: '0x0.st',
      description: 'Anonimowy file hosting',
      maxSize: '512MB',
      expiry: '1 rok (auto-extend)',
      features: ['Wszystkie typy plików', 'cURL friendly']
    },
    {
      platform: 'rentry',
      description: 'Markdown paste z custom URL',
      maxSize: '200KB',
      expiry: 'Nigdy',
      features: ['Markdown', 'Custom URL', 'Edycja']
    },
    {
      platform: 'sprunge',
      description: 'Najstarszy paste service',
      maxSize: '64KB',
      expiry: 'Unknown',
      features: ['Plain text', 'cURL']
    }
  ];
}

export default {
  publishToTelegraph,
  publishToDpaste,
  publishToRentry,
  publishToPasteRs,
  publishTo0x0,
  publishToSprunge,
  publishToHastebin,
  publishToMozillaPaste,
  publishToTermbin,
  publishToCatbox,
  publishToPrivateBin,
  publishToAllNoAuth,
  getNoAuthPlatforms
};
