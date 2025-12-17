import { GoogleGenerativeAI } from '@google/generative-ai';
import { CaptionVariation } from '../types';

if (!process.env.GOOGLE_AI_KEY) {
  console.warn('⚠️ GOOGLE_AI_KEY not set. AI features will not work.');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

// Style configurations for quick rewrite
const REWRITE_STYLES: Record<string, { prompt: string; emoji: string }> = {
  bold: {
    prompt: 'Make this confident, assertive, and impactful. Use strong language and commanding tone.',
    emoji: '💪'
  },
  smart: {
    prompt: 'Make this thoughtful, insightful, and intellectually engaging. Add depth and nuance.',
    emoji: '🧠'
  },
  funny: {
    prompt: 'Make this witty, humorous, and entertaining. Add clever wordplay or jokes.',
    emoji: '😄'
  },
  professional: {
    prompt: 'Make this polished, credible, and business-appropriate. Keep it formal yet engaging.',
    emoji: '💼'
  },
  casual: {
    prompt: 'Make this relaxed, friendly, and conversational. Use everyday language.',
    emoji: '😎'
  }
};

export interface QuickRewriteVariation {
  text: string;
  style: string;
  improvement: string;
}

/**
 * Quick rewrite content with different styles
 * @param content Original content to rewrite
 * @param style Style preference (bold, smart, funny, professional, casual, or 'all')
 * @param count Number of variations to generate
 * @returns Array of rewrite variations
 */
export async function quickRewrite(
  content: string,
  style: string = 'all',
  count: number = 5
): Promise<{ variations: QuickRewriteVariation[] }> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      }
    });

    const stylesToGenerate = style === 'all'
      ? Object.keys(REWRITE_STYLES)
      : [style];

    const stylePrompts = stylesToGenerate.map(s => {
      const config = REWRITE_STYLES[s];
      return config ? `${s.toUpperCase()}: ${config.prompt}` : '';
    }).filter(Boolean).join('\n');

    const prompt = `You are an expert content writer specializing in social media. Rewrite the following content in different styles.

ORIGINAL CONTENT:
"${content}"

STYLES TO GENERATE:
${stylePrompts}

Generate ${count} different versions of this content. Each version should:
1. Preserve the core message
2. Be optimized for social media (max 280 characters)
3. Match the specified style perfectly
4. Include appropriate emojis

For each variation, provide:
- The rewritten text
- Which style it uses (bold/smart/funny/professional/casual)
- A brief explanation of what makes this version better

Format as JSON:
{
  "variations": [
    {
      "text": "Rewritten content here...",
      "style": "bold",
      "improvement": "What makes this version effective..."
    }
  ]
}`;

    const resultPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout after 30s')), 30000)
    );

    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
    const responseText = result.response.text();

    // Parse response
    let parsed = null;

    const fullMatch = responseText.match(/\{[\s\S]*"variations"[\s\S]*\}/);
    if (fullMatch) {
      try {
        parsed = JSON.parse(fullMatch[0]);
      } catch (e) {
        console.warn('⚠️ Quick Rewrite: JSON parse failed, trying cleanup');
      }
    }

    if (!parsed) {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const cleanMatch = cleaned.match(/\{[\s\S]*\}/);
      if (cleanMatch) {
        try {
          parsed = JSON.parse(cleanMatch[0]);
        } catch (e) {
          console.warn('⚠️ Quick Rewrite: Cleaned JSON parse failed');
        }
      }
    }

    if (parsed && parsed.variations && parsed.variations.length > 0) {
      console.log(`✅ Quick Rewrite: Generated ${parsed.variations.length} variations`);
      return parsed;
    }

    // Fallback
    console.warn('⚠️ Quick Rewrite: Using fallback templates');
    return generateQuickRewriteFallback(content, stylesToGenerate);

  } catch (error) {
    console.error('❌ Quick Rewrite error:', error instanceof Error ? error.message : error);
    return generateQuickRewriteFallback(content, style === 'all' ? Object.keys(REWRITE_STYLES) : [style]);
  }
}

/**
 * Generate fallback rewrite variations
 */
function generateQuickRewriteFallback(
  content: string,
  styles: string[]
): { variations: QuickRewriteVariation[] } {
  const shortContent = content.substring(0, 200);

  const variations: QuickRewriteVariation[] = styles.slice(0, 5).map(style => {
    const config = REWRITE_STYLES[style] || REWRITE_STYLES.bold;
    let text = '';
    let improvement = '';

    switch (style) {
      case 'bold':
        text = `🔥 ${shortContent} Make no mistake about it.`;
        improvement = 'Added confident opener and assertive closing';
        break;
      case 'smart':
        text = `💡 Here's an interesting perspective: ${shortContent}`;
        improvement = 'Framed as thoughtful insight';
        break;
      case 'funny':
        text = `${shortContent} ...and yes, I'm serious 😅`;
        improvement = 'Added self-aware humor';
        break;
      case 'professional':
        text = `Key insight: ${shortContent.replace(/!/g, '.')}`;
        improvement = 'Polished and professional tone';
        break;
      case 'casual':
        text = `So basically ${shortContent.toLowerCase()} 🤷`;
        improvement = 'Conversational and relatable';
        break;
      default:
        text = `✨ ${shortContent}`;
        improvement = 'Enhanced with visual appeal';
    }

    return {
      text: text.substring(0, 280),
      style,
      improvement
    };
  });

  return { variations };
}


/**
 * Generate multiple caption variations for a topic using Google AI
 * @param topic The topic or content to generate captions for
 * @param tone The desired tone (e.g., "engaging", "funny", "informative")
 * @returns Array of caption variations with hashtags and reasoning
 */
export async function generateCaptions(
  topic: string,
  tone: string = 'engaging'
): Promise<{ variations: CaptionVariation[] }> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `You are a creative social media copywriter specialized in viral content.

Create 4 short, engaging post variations (max 240 characters each) about: "${topic}"

Requirements:
- Maximum 240 characters per variation
- Tone: ${tone} (funny, informative, inspirational, or engaging)
- Include emojis where appropriate
- Each variation should have a unique angle or hook

For each variation, also provide:
1. 5 relevant, trending hashtags
2. A brief reason (1 sentence) why this variation would perform well

Format your response as valid JSON:
{
  "variations": [
    {
      "text": "Your caption here...",
      "hashtags": ["#HashTag1", "#HashTag2", "#HashTag3", "#HashTag4", "#HashTag5"],
      "reason": "Why this would work..."
    }
  ]
}`;

    // Add timeout protection (30 seconds max - Gemini 2.5 needs more time)
    const resultPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout after 30s')), 30000)
    );

    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
    const responseText = result.response.text();

    // Strategy 1: Try extracting JSON with multiple patterns
    let parsed = null;

    // Try full JSON match
    const fullMatch = responseText.match(/\{[\s\S]*"variations"[\s\S]*\}/);
    if (fullMatch) {
      try {
        parsed = JSON.parse(fullMatch[0]);
      } catch (e) {
        console.warn('⚠️ AI: Full JSON parse failed, trying cleanup');
      }
    }

    // Try with markdown removal
    if (!parsed) {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const cleanMatch = cleaned.match(/\{[\s\S]*\}/);
      if (cleanMatch) {
        try {
          parsed = JSON.parse(cleanMatch[0]);
        } catch (e) {
          console.warn('⚠️ AI: Cleaned JSON parse failed');
        }
      }
    }

    if (parsed && parsed.variations && parsed.variations.length > 0) {
      console.log(`✅ AI: Generated ${parsed.variations.length} captions`);
      return parsed;
    }

    // Strategy 2: Try parsing raw response as variations
    console.warn('⚠️ AI: Could not parse JSON, trying raw text extraction');
    const lines = responseText.split('\n').filter((l: string) => l.trim().length > 20 && l.trim().length < 280);
    if (lines.length > 0) {
      const variations = lines.slice(0, 4).map((line: string) => ({
        text: line.trim().replace(/^[\d\.\-\*]+\s*/, '').substring(0, 240),
        hashtags: extractHashtagsFromText(topic),
        reason: 'AI-generated from response text'
      }));
      console.log(`✅ AI: Extracted ${variations.length} captions from raw text`);
      return { variations };
    }

    // Strategy 3: Return enhanced fallback templates
    console.warn('⚠️ AI: Using enhanced fallback templates');
    return {
      variations: [
        {
          text: `🔥 ${topic} is changing the game! Here's what you need to know right now 👇`,
          hashtags: ['#ViralContent', '#ContentCreation', '#Trending', '#MustSee', '#Viral'],
          reason: 'Urgency + curiosity gap = high engagement'
        },
        {
          text: `💡 Just discovered this about ${topic}... Why didn't anyone tell me sooner?`,
          hashtags: ['#Discovery', '#GameChanger', '#ProTip', '#MindBlown', '#Learn'],
          reason: 'Personal discovery + FOMO trigger'
        },
        {
          text: `${topic}: The truth nobody talks about. Thread 🧵`,
          hashtags: ['#Thread', '#Truth', '#Exposed', '#RealTalk', '#MustRead'],
          reason: 'Controversy + thread format = shares'
        },
        {
          text: `Stop scrolling! This ${topic} hack will save you hours ⚡`,
          hashtags: ['#LifeHack', '#Productivity', '#TimeSaver', '#Hack', '#Efficiency'],
          reason: 'Pattern interrupt + time-saving value'
        }
      ]
    };
  } catch (error) {
    console.error('❌ AI error:', error instanceof Error ? error.message : error);

    // Fallback to demo data if API fails
    return {
      variations: [
        {
          text: `🚀 ${topic}: Unlock the power of viral content! 💡 Learn strategies that actually work.`,
          hashtags: ['#ViralContent', '#ContentCreation', '#SocialMedia', '#Marketing', '#Growth'],
          reason: 'Hook with emoji + value proposition + call to curiosity'
        },
        {
          text: `💭 Stop guessing with ${topic}! Here's what top creators don't tell you... 👇`,
          hashtags: ['#ContentStrategy', '#CreatorTips', '#Viral', '#SocialMediaTips', '#ContentMarketing'],
          reason: 'Creates curiosity gap + authority positioning'
        },
        {
          text: `${topic} changed my content game. Thread 🧵 on what I learned after 10K posts:`,
          hashtags: ['#Thread', '#ContentTips', '#Viral', '#CreatorEconomy', '#SocialGrowth'],
          reason: 'Personal story + thread format = high engagement'
        },
        {
          text: `The ${topic} playbook nobody talks about. Saved you 100+ hours of trial and error ⚡`,
          hashtags: ['#ContentHacks', '#Viral', '#SocialMedia', '#Marketing', '#GrowthHacks'],
          reason: 'Value-driven + time-saving benefit'
        }
      ]
    };
  }
}

/**
 * Generate relevant hashtags for a topic
 * @param topic The topic to generate hashtags for
 * @param count Number of hashtags to generate
 * @returns Array of hashtags
 */
export async function generateHashtags(
  topic: string,
  count: number = 10
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      }
    });

    const prompt = `Generate ${count} relevant, trending hashtags for the topic: "${topic}"

Requirements:
- Must start with #
- Should be popular and searchable
- Mix of broad and specific tags
- Include industry-standard tags
- Consider current trends in 2025

Return ONLY a JSON array of hashtags, nothing else:
["#HashTag1", "#HashTag2", "#HashTag3", ...]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to extract JSON array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.filter((tag: string) => tag.startsWith('#')).slice(0, count);
    }

    // Fallback: generate basic hashtags from topic
    return extractHashtagsFromText(topic).slice(0, count);
  } catch (error) {
    console.error('Error generating hashtags:', error);
    // Return demo hashtags on error
    return extractHashtagsFromText(topic).slice(0, count);
  }
}

/**
 * Extract basic hashtags from text (fallback)
 */
function extractHashtagsFromText(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);

  // Create hashtags from words
  const hashtags = words.slice(0, 5).map(w => `#${w}`);

  // Add some generic popular tags
  hashtags.push('#trending', '#viral', '#socialmedia', '#content', '#marketing');

  return [...new Set(hashtags)]; // Remove duplicates
}

/**
 * Remix/regenerate content for a specific platform
 * Takes original content and adapts it for the target platform's style and constraints
 */
export async function remixContent(
  originalContent: string,
  targetPlatform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads' | 'all',
  tone: string = 'engaging'
): Promise<{ variations: CaptionVariation[] }> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 2048,
      }
    });

    const platformGuidelines = getPlatformGuidelines(targetPlatform);

    const prompt = `You are an expert social media content strategist. Your task is to remix/adapt the following content for ${targetPlatform === 'all' ? 'multiple platforms' : targetPlatform}.

ORIGINAL CONTENT:
"${originalContent}"

TARGET PLATFORM: ${targetPlatform}
TONE: ${tone}

${platformGuidelines}

Create 4 unique variations that:
1. Preserve the core message/value of the original
2. Are optimized for the target platform's audience and format
3. Include platform-appropriate hooks and CTAs
4. Feel native to the platform (not like cross-posted content)

For each variation, provide:
- The adapted text (respecting character limits)
- 5 relevant hashtags (platform-appropriate)
- A brief reason why this version would work well

Format as JSON:
{
  "variations": [
    {
      "text": "Adapted content here...",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "reason": "Why this works for the platform..."
    }
  ]
}`;

    const resultPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout after 30s')), 30000)
    );

    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
    const responseText = result.response.text();

    // Parse response
    let parsed = null;

    const fullMatch = responseText.match(/\{[\s\S]*"variations"[\s\S]*\}/);
    if (fullMatch) {
      try {
        parsed = JSON.parse(fullMatch[0]);
      } catch (e) {
        console.warn('⚠️ AI Remix: JSON parse failed, trying cleanup');
      }
    }

    if (!parsed) {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const cleanMatch = cleaned.match(/\{[\s\S]*\}/);
      if (cleanMatch) {
        try {
          parsed = JSON.parse(cleanMatch[0]);
        } catch (e) {
          console.warn('⚠️ AI Remix: Cleaned JSON parse failed');
        }
      }
    }

    if (parsed && parsed.variations && parsed.variations.length > 0) {
      console.log(`✅ AI Remix: Generated ${parsed.variations.length} variations for ${targetPlatform}`);
      return parsed;
    }

    // Fallback
    console.warn('⚠️ AI Remix: Using fallback templates');
    return generateRemixFallback(originalContent, targetPlatform);

  } catch (error) {
    console.error('❌ AI Remix error:', error instanceof Error ? error.message : error);
    return generateRemixFallback(originalContent, targetPlatform);
  }
}

/**
 * Get platform-specific guidelines for content generation
 */
function getPlatformGuidelines(platform: string): string {
  const guidelines: Record<string, string> = {
    'Twitter': `
TWITTER/X GUIDELINES:
- Maximum 280 characters
- Use thread format (🧵) for longer content
- Emojis increase engagement
- Questions drive replies
- Hot takes get retweets
- Tag relevant accounts when appropriate`,

    'Reddit': `
REDDIT GUIDELINES:
- Title is crucial (most users only read titles)
- Be authentic, not promotional
- Match the subreddit's culture and rules
- Longer, detailed posts work well
- Ask questions to encourage discussion
- Avoid clickbait - Redditors hate it`,

    'Dev.to': `
DEV.TO GUIDELINES:
- Technical audience appreciates depth
- Use code snippets when relevant
- Include practical takeaways
- Series format works well for tutorials
- Tag with relevant technologies
- Be helpful, not self-promotional`,

    'Threads': `
THREADS GUIDELINES:
- Maximum 500 characters
- Conversational, casual tone
- Visual content performs well
- Stories and personal experiences resonate
- Cross-posting from Instagram works
- Community engagement is key`,

    'all': `
MULTI-PLATFORM GUIDELINES:
- Create content that can be adapted
- Core message should be platform-agnostic
- Include hooks that work across platforms
- Balance brevity with substance`
  };

  return guidelines[platform] || guidelines['all'];
}

/**
 * Generate fallback remix variations
 */
function generateRemixFallback(
  originalContent: string,
  targetPlatform: string
): { variations: CaptionVariation[] } {
  const shortContent = originalContent.substring(0, 200);

  const variations: CaptionVariation[] = [
    {
      text: `🔥 ${shortContent}${originalContent.length > 200 ? '...' : ''} What do you think? 👇`,
      hashtags: extractHashtagsFromText(originalContent).slice(0, 5),
      reason: 'Engagement hook with question CTA'
    },
    {
      text: `💡 Here's something worth sharing: ${shortContent.substring(0, 150)}...`,
      hashtags: extractHashtagsFromText(originalContent).slice(0, 5),
      reason: 'Value-forward framing'
    },
    {
      text: `This changed my perspective on ${shortContent.substring(0, 100)}... Thread 🧵`,
      hashtags: extractHashtagsFromText(originalContent).slice(0, 5),
      reason: 'Personal story + thread format'
    },
    {
      text: `📢 ${shortContent.substring(0, 180)} Share if you agree!`,
      hashtags: extractHashtagsFromText(originalContent).slice(0, 5),
      reason: 'Direct share CTA'
    }
  ];

  // Adjust for platform constraints
  if (targetPlatform === 'Twitter') {
    variations.forEach(v => {
      v.text = v.text.substring(0, 270);
    });
  }

  return { variations };
}

/**
 * Platform-specific style configurations
 */
const PLATFORM_STYLES: Record<string, { maxLength: number; style: string; tips: string }> = {
  Twitter: {
    maxLength: 280,
    style: 'concise, punchy, with hooks and threads potential',
    tips: 'Use emojis sparingly, ask questions, create curiosity gaps'
  },
  Reddit: {
    maxLength: 1000,
    style: 'informative, conversational, community-focused',
    tips: 'Add value, be authentic, reference the community, avoid self-promotion'
  },
  'Dev.to': {
    maxLength: 500,
    style: 'technical but accessible, educational, developer-focused',
    tips: 'Include code snippets context, use technical terms correctly, be helpful'
  },
  Threads: {
    maxLength: 500,
    style: 'casual, conversational, Instagram-adjacent',
    tips: 'Be authentic, use emojis naturally, encourage discussion'
  }
};

/**
 * Remix/adapt content for a specific platform
 * @param originalContent The original post content to remix
 * @param targetPlatform The platform to optimize for
 * @param tone The desired tone
 * @returns Remixed content variations
 */
export async function remixForPlatform(
  originalContent: string,
  targetPlatform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads' | 'all',
  tone: string = 'engaging'
): Promise<{ variations: CaptionVariation[]; platform: string }> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 2048,
      }
    });

    const platforms = targetPlatform === 'all'
      ? ['Twitter', 'Reddit', 'Dev.to', 'Threads']
      : [targetPlatform];

    const allVariations: CaptionVariation[] = [];

    for (const platform of platforms) {
      const config = PLATFORM_STYLES[platform] || PLATFORM_STYLES.Twitter;

      const prompt = `You are an expert social media content strategist specializing in ${platform}.

ORIGINAL CONTENT TO REMIX:
"${originalContent}"

TARGET PLATFORM: ${platform}
MAX LENGTH: ${config.maxLength} characters
STYLE: ${config.style}
TIPS: ${config.tips}
TONE: ${tone}

Create 2 unique variations of this content optimized for ${platform}.

Requirements:
- Stay within ${config.maxLength} characters
- Maintain the core message but adapt the style for ${platform}
- Make it feel native to ${platform} users
- Include platform-appropriate formatting

For each variation provide:
1. The remixed text
2. 5 relevant hashtags for ${platform}
3. A brief reason why this version works for ${platform}

Format as JSON:
{
  "variations": [
    {
      "text": "Your remixed content here...",
      "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
      "reason": "Why this works for ${platform}..."
    }
  ]
}`;

      try {
        const resultPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI timeout')), 25000)
        );

        const result = await Promise.race([resultPromise, timeoutPromise]) as any;
        const responseText = result.response.text();

        // Parse JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*"variations"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.variations && Array.isArray(parsed.variations)) {
              // Add platform info to each variation
              const platformVariations = parsed.variations.map((v: CaptionVariation) => ({
                ...v,
                reason: `[${platform}] ${v.reason}`
              }));
              allVariations.push(...platformVariations);
            }
          } catch {
            console.warn(`⚠️ AI: Failed to parse JSON for ${platform}`);
          }
        }
      } catch (err) {
        console.warn(`⚠️ AI: Error generating for ${platform}:`, err instanceof Error ? err.message : err);
      }
    }

    if (allVariations.length > 0) {
      console.log(`✅ AI: Generated ${allVariations.length} remix variations`);
      return { variations: allVariations, platform: targetPlatform };
    }

    // Fallback: return simple adaptations
    console.warn('⚠️ AI: Using fallback remix');
    return {
      variations: platforms.map(platform => {
        const config = PLATFORM_STYLES[platform] || PLATFORM_STYLES.Twitter;
        const truncated = originalContent.substring(0, config.maxLength - 20);
        return {
          text: `${truncated}${originalContent.length > config.maxLength - 20 ? '...' : ''}`,
          hashtags: extractHashtagsFromText(originalContent).slice(0, 5),
          reason: `[${platform}] Adapted for platform character limit`
        };
      }),
      platform: targetPlatform
    };
  } catch (error) {
    console.error('❌ AI remix error:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Generate optimal posting time suggestions
 * @param timezone User's timezone
 * @returns Suggested posting times
 */
export async function suggestPostingTimes(timezone: string = 'UTC'): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a social media strategist. Suggest 3 optimal times to post on Twitter/X for maximum engagement.

User timezone: ${timezone}
Current date: ${new Date().toISOString()}

Consider:
- Peak engagement hours
- Timezone-specific activity patterns
- Weekday vs weekend differences
- Industry best practices for 2025

Return as JSON array of time strings with brief reasoning:
[
  "9:00 AM - Morning commute, high mobile usage",
  "1:00 PM - Lunch break browsing",
  "7:00 PM - Evening relaxation time"
]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback times
    return [
      '9:00 AM - Morning engagement peak',
      '1:00 PM - Lunch hour browsing',
      '7:00 PM - Evening activity',
    ];
  } catch (error) {
    console.error('Error suggesting times:', error);
    return [
      '9:00 AM - Morning engagement peak',
      '1:00 PM - Lunch hour browsing',
      '7:00 PM - Evening activity',
    ];
  }
}

/**
 * Translate content to a target language
 * @param content The content to translate
 * @param sourceLanguage Optional source language (auto-detected if not provided)
 * @param targetLanguage Target language (default: English)
 * @returns Translated content
 */
export async function translateContent(
  content: string,
  sourceLanguage?: string,
  targetLanguage: string = 'English'
): Promise<{ translated: string; detectedLanguage: string; confidence: number; targetLanguage: string }> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `You are an expert translator. Translate the following content to ${targetLanguage}.
${sourceLanguage ? `Source language: ${sourceLanguage}` : 'Detect the source language automatically.'}

CONTENT TO TRANSLATE:
"${content}"

Requirements:
- Preserve the original tone and style
- Keep emojis and special formatting
- Maintain hashtags as-is (don't translate them)
- If the content is already in ${targetLanguage}, return it unchanged

Respond with JSON only:
{
  "translated": "The translated text in ${targetLanguage}",
  "detectedLanguage": "The detected source language (e.g., Spanish, French, Polish)",
  "confidence": 0.95
}`;

    const resultPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Translation timeout')), 20000)
    );

    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
    const responseText = result.response.text();

    // Parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`✅ Translate: ${parsed.detectedLanguage} → ${targetLanguage}`);
        return {
          translated: parsed.translated || content,
          detectedLanguage: parsed.detectedLanguage || 'Unknown',
          confidence: parsed.confidence || 0.8,
          targetLanguage
        };
      } catch {
        console.warn('⚠️ Translate: JSON parse failed');
      }
    }

    // Fallback
    return { translated: content, detectedLanguage: 'Unknown', confidence: 0.5, targetLanguage };

  } catch (error) {
    console.error('❌ Translation error:', error instanceof Error ? error.message : error);
    return { translated: content, detectedLanguage: 'Unknown', confidence: 0, targetLanguage };
  }
}

/**
 * Improve grammar and spelling of content
 * @param content The content to improve
 * @returns Improved content with corrections
 */
export async function improveGrammar(
  content: string
): Promise<{ improved: string; corrections: string[]; score: number }> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `You are an expert editor specializing in grammar and spelling. Improve the following content.

CONTENT TO IMPROVE:
"${content}"

Requirements:
- Fix all grammar and spelling errors
- Improve sentence structure where needed
- Keep the original meaning and tone
- Maintain emojis and hashtags
- Don't change the content's voice or style dramatically

Respond with JSON only:
{
  "improved": "The corrected text with perfect grammar",
  "corrections": ["List of corrections made", "e.g., 'Changed your to you're'"],
  "score": 85
}

The score (0-100) indicates the original content's grammar quality.`;

    const resultPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Grammar check timeout')), 20000)
    );

    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
    const responseText = result.response.text();

    // Parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`✅ Grammar: ${parsed.corrections?.length || 0} corrections made`);
        return {
          improved: parsed.improved || content,
          corrections: parsed.corrections || [],
          score: parsed.score || 100
        };
      } catch {
        console.warn('⚠️ Grammar: JSON parse failed');
      }
    }

    // Fallback - no corrections
    return { improved: content, corrections: [], score: 100 };

  } catch (error) {
    console.error('❌ Grammar improvement error:', error instanceof Error ? error.message : error);
    return { improved: content, corrections: [], score: 0 };
  }
}

