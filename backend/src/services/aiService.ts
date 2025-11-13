import { GoogleGenerativeAI } from '@google/generative-ai';
import { CaptionVariation } from '../types';

if (!process.env.GOOGLE_AI_KEY) {
  console.warn('⚠️ GOOGLE_AI_KEY not set. AI features will not work.');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    // Fallback: return raw text as single variation
    return {
      variations: [
        {
          text: responseText.substring(0, 240),
          hashtags: extractHashtagsFromText(topic),
          reason: 'AI-generated content',
        },
      ],
    };
  } catch (error) {
    console.error('Error generating captions:', error);
    
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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
 * Generate optimal posting time suggestions
 * @param timezone User's timezone
 * @returns Suggested posting times
 */
export async function suggestPostingTimes(timezone: string = 'UTC'): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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
