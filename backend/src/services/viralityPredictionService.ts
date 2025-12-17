/**
 * 🔮 Virality Prediction Service
 * Uses AI (Google Gemini) to analyze posts and predict viral potential
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ViralityPrediction, ViralityFactor } from '../types';

// ============================================================================
// INITIALIZATION
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

let genAI: GoogleGenerativeAI | null = null;

if (process.env.GOOGLE_AI_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
} else {
    console.warn('⚠️ GOOGLE_AI_KEY not set. Virality prediction will use heuristic fallback.');
}

// ============================================================================
// AI PREDICTION
// ============================================================================

/**
 * Predict virality of a post using Google Gemini AI
 */
export async function predictVirality(
    content: string,
    platform: string,
    author?: string
): Promise<ViralityPrediction> {
    const postId = `pred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Try AI prediction first
    if (genAI) {
        try {
            const prediction = await predictWithAI(content, platform, postId, author);

            // Save prediction to database
            await savePrediction(prediction);

            return prediction;
        } catch (error) {
            console.error('❌ AI prediction failed, using heuristic:', error);
        }
    }

    // Fallback to heuristic prediction
    const heuristicPrediction = predictWithHeuristics(content, platform, postId, author);
    await savePrediction(heuristicPrediction);

    return heuristicPrediction;
}

/**
 * AI-powered prediction using Google Gemini
 */
async function predictWithAI(
    content: string,
    platform: string,
    postId: string,
    author?: string
): Promise<ViralityPrediction> {
    if (!genAI) {
        throw new Error('Gemini AI not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this social media post for viral potential on ${platform}.

POST CONTENT:
"${content}"

ANALYSIS CRITERIA:
1. Hook Strength (0-20): How attention-grabbing is the opening?
2. Emotional Triggers (0-20): Does it evoke strong emotions (curiosity, humor, inspiration, controversy)?
3. Shareability (0-20): Would people want to share this with others?
4. Relatability (0-15): How many people can connect with this content?
5. Timeliness (0-15): Is it relevant to current trends/topics?
6. Call-to-Action (0-10): Does it encourage engagement?

RESPOND ONLY WITH VALID JSON (no markdown, no code blocks):
{
  "viral_score": <total score 0-100>,
  "confidence": <0.0-1.0>,
  "predicted_reach": "<range like '1K-5K', '5K-10K', '10K-50K', '50K-100K', '100K+'>",
  "factors": [
    {
      "name": "<factor name>",
      "impact": "<positive|negative|neutral>",
      "score": <-100 to +100>,
      "reason": "<brief explanation>"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse JSON response
    let parsed;
    try {
        // Clean up response - remove markdown code blocks if present
        const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        parsed = JSON.parse(cleanedResponse);
    } catch {
        console.warn('⚠️ Could not parse AI response, using heuristic');
        return predictWithHeuristics(content, platform, postId, author);
    }

    return {
        post_id: postId,
        platform,
        content,
        author,
        viral_score: Math.min(100, Math.max(0, parsed.viral_score || 50)),
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
        predicted_reach: parsed.predicted_reach || '1K-5K',
        factors: (parsed.factors || []).map((f: any) => ({
            name: f.name || 'Unknown',
            impact: f.impact || 'neutral',
            score: Math.min(100, Math.max(-100, f.score || 0)),
            reason: f.reason || 'No details'
        })),
        predicted_at: new Date()
    };
}

/**
 * Heuristic-based prediction (fallback when AI unavailable)
 */
function predictWithHeuristics(
    content: string,
    platform: string,
    postId: string,
    author?: string
): ViralityPrediction {
    const factors: ViralityFactor[] = [];
    let totalScore = 50; // Base score

    // Factor 1: Hook strength (first 50 chars)
    const firstLine = content.substring(0, 50).toLowerCase();
    const hookPatterns = ['🔥', '💡', '🚀', 'thread', 'just', 'breaking', 'i just', 'here\'s', 'how to', 'why'];
    const hasStrongHook = hookPatterns.some(p => firstLine.includes(p));

    if (hasStrongHook) {
        totalScore += 15;
        factors.push({
            name: 'Hook Strength',
            impact: 'positive',
            score: 15,
            reason: 'Strong attention-grabbing opening'
        });
    } else {
        factors.push({
            name: 'Hook Strength',
            impact: 'neutral',
            score: 0,
            reason: 'Opening could be more engaging'
        });
    }

    // Factor 2: Emotional triggers
    const emotionalWords = ['amazing', 'incredible', 'game-changer', 'mind-blowing', 'finally', 'never', 'always', 'best', 'worst', 'love', 'hate', 'insane', 'crazy'];
    const contentLower = content.toLowerCase();
    const emotionalCount = emotionalWords.filter(w => contentLower.includes(w)).length;

    if (emotionalCount >= 2) {
        totalScore += 12;
        factors.push({
            name: 'Emotional Triggers',
            impact: 'positive',
            score: 12,
            reason: 'Contains emotionally charged language'
        });
    } else if (emotionalCount === 1) {
        totalScore += 5;
        factors.push({
            name: 'Emotional Triggers',
            impact: 'positive',
            score: 5,
            reason: 'Some emotional appeal'
        });
    } else {
        factors.push({
            name: 'Emotional Triggers',
            impact: 'neutral',
            score: 0,
            reason: 'Could benefit from more emotional language'
        });
    }

    // Factor 3: Emojis (engagement boosters)
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount >= 3) {
        totalScore += 8;
        factors.push({
            name: 'Visual Appeal',
            impact: 'positive',
            score: 8,
            reason: 'Good use of emojis for visual engagement'
        });
    } else if (emojiCount === 0 && platform === 'Twitter') {
        totalScore -= 5;
        factors.push({
            name: 'Visual Appeal',
            impact: 'negative',
            score: -5,
            reason: 'Consider adding emojis for Twitter engagement'
        });
    }

    // Factor 4: Content length
    const wordCount = content.split(/\s+/).length;
    const optimalLength = platform === 'Twitter' ? { min: 15, max: 45 }
        : platform === 'Reddit' ? { min: 50, max: 300 }
            : { min: 30, max: 150 };

    if (wordCount >= optimalLength.min && wordCount <= optimalLength.max) {
        totalScore += 10;
        factors.push({
            name: 'Content Length',
            impact: 'positive',
            score: 10,
            reason: `Optimal length for ${platform}`
        });
    } else if (wordCount < optimalLength.min) {
        totalScore -= 5;
        factors.push({
            name: 'Content Length',
            impact: 'negative',
            score: -5,
            reason: 'Content might be too short'
        });
    }

    // Factor 5: Call to action
    const ctaPatterns = ['follow', 'share', 'retweet', 'comment', 'like', 'subscribe', 'check out', 'click', 'link in', 'thoughts?', 'agree?', 'what do you think'];
    const hasCTA = ctaPatterns.some(p => contentLower.includes(p));

    if (hasCTA) {
        totalScore += 10;
        factors.push({
            name: 'Call to Action',
            impact: 'positive',
            score: 10,
            reason: 'Encourages audience interaction'
        });
    } else {
        factors.push({
            name: 'Call to Action',
            impact: 'neutral',
            score: 0,
            reason: 'Adding a CTA could boost engagement'
        });
    }

    // Factor 6: Hashtags (platform-specific)
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    if (platform === 'Twitter' && hashtagCount >= 1 && hashtagCount <= 3) {
        totalScore += 5;
        factors.push({
            name: 'Hashtag Usage',
            impact: 'positive',
            score: 5,
            reason: 'Good hashtag usage for discoverability'
        });
    } else if (platform === 'Twitter' && hashtagCount > 5) {
        totalScore -= 5;
        factors.push({
            name: 'Hashtag Usage',
            impact: 'negative',
            score: -5,
            reason: 'Too many hashtags can appear spammy'
        });
    }

    // Clamp total score
    totalScore = Math.min(100, Math.max(0, totalScore));

    // Calculate predicted reach based on score
    const predictedReach = totalScore >= 80 ? '100K+'
        : totalScore >= 65 ? '50K-100K'
            : totalScore >= 50 ? '10K-50K'
                : totalScore >= 35 ? '5K-10K'
                    : '1K-5K';

    // Confidence based on how many factors we could analyze
    const confidence = Math.min(0.8, 0.5 + (factors.length * 0.05));

    return {
        post_id: postId,
        platform,
        content,
        author,
        viral_score: totalScore,
        confidence: parseFloat(confidence.toFixed(2)),
        predicted_reach: predictedReach,
        factors,
        predicted_at: new Date()
    };
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Save prediction to database
 */
async function savePrediction(prediction: ViralityPrediction): Promise<boolean> {
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('virality_predictions')
            .insert([{
                post_id: prediction.post_id,
                platform: prediction.platform,
                content: prediction.content,
                author: prediction.author,
                viral_score: prediction.viral_score,
                confidence: prediction.confidence,
                predicted_reach: prediction.predicted_reach,
                factors: prediction.factors,
                predicted_at: new Date().toISOString()
            }]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('❌ Error saving prediction:', error);
        return false;
    }
}

/**
 * Get top viral candidates from stored predictions
 */
export async function getTopViralCandidates(
    platform?: string,
    limit: number = 10
): Promise<ViralityPrediction[]> {
    if (!supabase) {
        return generateMockPredictions(platform, limit);
    }

    try {
        let query = supabase
            .from('virality_predictions')
            .select('*')
            .order('viral_score', { ascending: false })
            .limit(limit);

        if (platform) {
            query = query.eq('platform', platform);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (!data || data.length === 0) {
            return generateMockPredictions(platform, limit);
        }

        return data.map(row => ({
            post_id: row.post_id,
            platform: row.platform,
            content: row.content,
            author: row.author,
            viral_score: row.viral_score,
            confidence: row.confidence,
            predicted_reach: row.predicted_reach,
            factors: row.factors || [],
            predicted_at: new Date(row.predicted_at)
        }));
    } catch (error) {
        console.error('❌ Error fetching viral candidates:', error);
        return generateMockPredictions(platform, limit);
    }
}

/**
 * Get prediction history for a specific post
 */
export async function getPredictionHistory(postId: string): Promise<ViralityPrediction[]> {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('virality_predictions')
            .select('*')
            .eq('post_id', postId)
            .order('predicted_at', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('❌ Error fetching prediction history:', error);
        return [];
    }
}

// ============================================================================
// MOCK DATA
// ============================================================================

function generateMockPredictions(platform?: string, limit: number = 5): ViralityPrediction[] {
    const mockPredictions: ViralityPrediction[] = [
        {
            post_id: 'mock-viral-1',
            platform: 'Twitter',
            content: '🔥 Just shipped a feature that took 6 months to build in 2 days using AI. The future of development is here. Thread 🧵',
            author: 'ai_developer',
            viral_score: 87,
            confidence: 0.85,
            predicted_reach: '50K-100K',
            factors: [
                { name: 'Hook Strength', impact: 'positive', score: 18, reason: 'Strong emotional hook with fire emoji' },
                { name: 'Trending Topic', impact: 'positive', score: 20, reason: 'AI development is highly trending' },
                { name: 'Thread Format', impact: 'positive', score: 15, reason: 'Thread format encourages saves/shares' }
            ]
        },
        {
            post_id: 'mock-viral-2',
            platform: 'Reddit',
            content: 'I interviewed 100 senior developers about their biggest regrets. Here are the 5 patterns nobody talks about...',
            author: 'career_insights',
            viral_score: 78,
            confidence: 0.82,
            predicted_reach: '50K-100K',
            factors: [
                { name: 'Data-Driven', impact: 'positive', score: 16, reason: 'Specific numbers build credibility' },
                { name: 'Career Content', impact: 'positive', score: 14, reason: 'Career advice resonates widely' },
                { name: 'Curiosity Gap', impact: 'positive', score: 12, reason: 'Teases exclusive insights' }
            ]
        },
        {
            post_id: 'mock-viral-3',
            platform: 'Twitter',
            content: 'Every JavaScript developer should know these 7 console methods. Most only use console.log 👇',
            author: 'js_tips_daily',
            viral_score: 72,
            confidence: 0.79,
            predicted_reach: '10K-50K',
            factors: [
                { name: 'Educational Value', impact: 'positive', score: 15, reason: 'Practical, actionable tips' },
                { name: 'Broad Appeal', impact: 'positive', score: 12, reason: 'Relevant to large developer audience' },
                { name: 'List Format', impact: 'positive', score: 8, reason: 'Easy to consume format' }
            ]
        },
        {
            post_id: 'mock-viral-4',
            platform: 'Threads',
            content: 'Controversial take: 10x engineers dont exist. What exists is 10x environments. Let me explain...',
            author: 'tech_hot_takes',
            viral_score: 68,
            confidence: 0.75,
            predicted_reach: '10K-50K',
            factors: [
                { name: 'Controversy', impact: 'positive', score: 16, reason: 'Challenges popular belief' },
                { name: 'Thought Leadership', impact: 'positive', score: 10, reason: 'Unique perspective' },
                { name: 'Debate Potential', impact: 'positive', score: 8, reason: 'Encourages comments' }
            ]
        },
        {
            post_id: 'mock-viral-5',
            platform: 'Dev.to',
            content: 'I built a full-stack app in 48 hours using Claude and Cursor. Here is my complete workflow and prompts:',
            author: 'ai_builder',
            viral_score: 65,
            confidence: 0.73,
            predicted_reach: '10K-50K',
            factors: [
                { name: 'AI Tools Interest', impact: 'positive', score: 14, reason: 'High interest in AI dev tools' },
                { name: 'Tutorial Format', impact: 'positive', score: 12, reason: 'Actionable content' },
                { name: 'Time Challenge', impact: 'positive', score: 8, reason: '48-hour constraint adds interest' }
            ]
        }
    ];

    let filtered = mockPredictions;
    if (platform) {
        filtered = mockPredictions.filter(p => p.platform.toLowerCase() === platform.toLowerCase());
    }

    return filtered.slice(0, limit);
}
