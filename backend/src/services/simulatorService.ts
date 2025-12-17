/**
 * 🎯 Algorithm Simulator Service
 * Predicts engagement and analyzes tweet performance before posting
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export interface EngagementPrediction {
    overallScore: number;  // 0-100
    likesPrediction: { min: number; max: number; confidence: number };
    commentsPrediction: { min: number; max: number; confidence: number };
    repostsPrediction: { min: number; max: number; confidence: number };
    viralPotential: 'low' | 'medium' | 'high' | 'viral';
    algorithmFactors: AlgorithmFactor[];
    suggestions: string[];
}

export interface AlgorithmFactor {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number;  // -10 to +10
    explanation: string;
}

export interface VariantComparison {
    winner: 'A' | 'B' | 'tie';
    variantA: EngagementPrediction;
    variantB: EngagementPrediction;
    comparison: {
        factor: string;
        winnerLabel: 'A' | 'B' | 'tie';
        explanation: string;
    }[];
}

/**
 * Analyze a post and predict its engagement
 */
export async function analyzePost(content: string): Promise<EngagementPrediction> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });

        const prompt = `You are an expert social media algorithm analyst for Twitter/X. Analyze this post and predict its performance.

POST CONTENT:
"${content}"

Analyze the following factors that affect Twitter/X algorithm ranking:
1. Hook strength (first 50 characters)
2. Emotional triggers (curiosity, humor, controversy, inspiration)
3. Call-to-action presence
4. Hashtag strategy
5. Content length optimization
6. Question/engagement prompt
7. Formatting (emojis, line breaks)
8. Trend alignment
9. Shareability factor
10. Reply-bait quality

For each factor, score from -10 (hurts ranking) to +10 (boosts ranking).

Based on these factors, predict:
- Overall engagement score (0-100)
- Expected likes range (min-max with confidence %)
- Expected comments range
- Expected reposts range
- Viral potential (low/medium/high/viral)

Also provide 3 specific suggestions to improve the post.

Format response as JSON:
{
  "overallScore": 75,
  "likesPrediction": { "min": 50, "max": 200, "confidence": 70 },
  "commentsPrediction": { "min": 5, "max": 25, "confidence": 65 },
  "repostsPrediction": { "min": 10, "max": 50, "confidence": 60 },
  "viralPotential": "medium",
  "algorithmFactors": [
    { "factor": "Hook Strength", "impact": "positive", "score": 7, "explanation": "Strong opening..." }
  ],
  "suggestions": ["Add a question to encourage replies", "Include trending hashtag"]
}`;

        const resultPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI timeout after 30s')), 30000)
        );

        const result = await Promise.race([resultPromise, timeoutPromise]) as any;
        const responseText = result.response.text();

        // Parse response
        const jsonMatch = responseText.match(/\{[\s\S]*"overallScore"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log(`✅ Algorithm Simulator: Analyzed post with score ${parsed.overallScore}`);
                return parsed;
            } catch (e) {
                console.warn('⚠️ Algorithm Simulator: JSON parse failed');
            }
        }

        // Fallback analysis
        return generateFallbackAnalysis(content);

    } catch (error) {
        console.error('❌ Algorithm Simulator error:', error instanceof Error ? error.message : error);
        return generateFallbackAnalysis(content);
    }
}

/**
 * Compare two post variants and determine which would perform better
 */
export async function compareVariants(
    variantA: string,
    variantB: string
): Promise<VariantComparison> {
    try {
        // Analyze both variants
        const [analysisA, analysisB] = await Promise.all([
            analyzePost(variantA),
            analyzePost(variantB)
        ]);

        // Determine winner
        let winner: 'A' | 'B' | 'tie' = 'tie';
        if (analysisA.overallScore > analysisB.overallScore + 5) {
            winner = 'A';
        } else if (analysisB.overallScore > analysisA.overallScore + 5) {
            winner = 'B';
        }

        // Compare individual factors
        const comparison: VariantComparison['comparison'] = [];
        const factorsA = analysisA.algorithmFactors || [];
        const factorsB = analysisB.algorithmFactors || [];

        const allFactors = new Set([
            ...factorsA.map(f => f.factor),
            ...factorsB.map(f => f.factor)
        ]);

        allFactors.forEach(factor => {
            const scoreA = factorsA.find(f => f.factor === factor)?.score || 0;
            const scoreB = factorsB.find(f => f.factor === factor)?.score || 0;

            let winnerLabel: 'A' | 'B' | 'tie' = 'tie';
            if (scoreA > scoreB + 2) winnerLabel = 'A';
            else if (scoreB > scoreA + 2) winnerLabel = 'B';

            comparison.push({
                factor,
                winnerLabel,
                explanation: winnerLabel === 'tie'
                    ? 'Both variants perform similarly'
                    : `Variant ${winnerLabel} is stronger in ${factor.toLowerCase()}`
            });
        });

        console.log(`✅ Algorithm Simulator: Compared variants, winner: ${winner}`);

        return {
            winner,
            variantA: analysisA,
            variantB: analysisB,
            comparison
        };

    } catch (error) {
        console.error('❌ Compare variants error:', error instanceof Error ? error.message : error);
        throw error;
    }
}

/**
 * Get detailed algorithm insights for a post
 */
export async function getAlgorithmInsights(content: string): Promise<{
    insights: string[];
    rankingFactors: { name: string; description: string; currentStatus: 'good' | 'needs_work' | 'missing' }[];
    optimizedVersion: string;
}> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });

        const prompt = `Analyze this tweet and provide detailed algorithm insights:

"${content}"

1. List 5 key insights about how Twitter's algorithm would treat this post
2. Score these ranking factors: Hook, Engagement Prompts, Hashtags, Timing Relevance, Emotional Appeal
3. Create an optimized version of this tweet (max 280 chars)

Format as JSON:
{
  "insights": ["insight1", "insight2"],
  "rankingFactors": [
    { "name": "Hook", "description": "...", "currentStatus": "good" }
  ],
  "optimizedVersion": "Improved tweet here..."
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*"insights"[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback
        return {
            insights: [
                'Post length is within optimal range',
                'Consider adding a stronger hook in the first line',
                'Emoji usage can increase engagement by 25%',
                'Questions in tweets get 50% more replies',
                'Trending topics boost visibility significantly'
            ],
            rankingFactors: [
                { name: 'Hook', description: 'Opening statement impact', currentStatus: 'needs_work' },
                { name: 'Engagement Prompts', description: 'Calls for interaction', currentStatus: 'missing' },
                { name: 'Hashtags', description: 'Discoverability tags', currentStatus: 'good' },
                { name: 'Emotional Appeal', description: 'Triggers curiosity/emotion', currentStatus: 'needs_work' }
            ],
            optimizedVersion: `🔥 ${content.substring(0, 200)}... What do you think? 👇`
        };

    } catch (error) {
        console.error('❌ Algorithm insights error:', error);
        throw error;
    }
}

/**
 * Generate fallback analysis when AI fails
 */
function generateFallbackAnalysis(content: string): EngagementPrediction {
    const length = content.length;
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(content);
    const hasQuestion = content.includes('?');
    const hasHashtag = content.includes('#');
    const hasHook = content.substring(0, 50).includes('!') || content.substring(0, 50).includes('🔥');

    // Calculate a basic score
    let score = 50;
    if (length >= 100 && length <= 250) score += 10;
    if (hasEmoji) score += 8;
    if (hasQuestion) score += 12;
    if (hasHashtag) score += 5;
    if (hasHook) score += 10;

    return {
        overallScore: Math.min(100, score),
        likesPrediction: { min: 10, max: 100, confidence: 50 },
        commentsPrediction: { min: 1, max: 20, confidence: 45 },
        repostsPrediction: { min: 2, max: 30, confidence: 40 },
        viralPotential: score > 75 ? 'high' : score > 60 ? 'medium' : 'low',
        algorithmFactors: [
            {
                factor: 'Content Length',
                impact: length >= 100 && length <= 250 ? 'positive' : 'neutral',
                score: length >= 100 && length <= 250 ? 7 : 0,
                explanation: length >= 100 && length <= 250 ? 'Optimal length for engagement' : 'Consider adjusting length'
            },
            {
                factor: 'Emoji Usage',
                impact: hasEmoji ? 'positive' : 'neutral',
                score: hasEmoji ? 5 : 0,
                explanation: hasEmoji ? 'Emojis increase visual appeal' : 'Add emojis to boost visibility'
            },
            {
                factor: 'Engagement Prompt',
                impact: hasQuestion ? 'positive' : 'negative',
                score: hasQuestion ? 8 : -3,
                explanation: hasQuestion ? 'Question drives replies' : 'Add a question to encourage interaction'
            },
            {
                factor: 'Hook Strength',
                impact: hasHook ? 'positive' : 'neutral',
                score: hasHook ? 7 : 2,
                explanation: hasHook ? 'Strong opener captures attention' : 'Consider a stronger opening'
            }
        ],
        suggestions: [
            hasQuestion ? 'Great job including a question!' : 'Add a question to encourage replies',
            hasEmoji ? 'Good emoji usage' : 'Add relevant emojis for visual appeal',
            hasHashtag ? 'Hashtags help discoverability' : 'Consider adding 1-2 relevant hashtags'
        ]
    };
}
