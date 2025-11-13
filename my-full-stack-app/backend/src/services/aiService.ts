import { google } from 'googleapis';

const AI_API_KEY = process.env.AI_API_KEY; // Ensure you have your API key set in environment variables

export const generateCaptions = async (topic: string): Promise<string[]> => {
    const client = google.auth.fromAPIKey(AI_API_KEY);
    const aiService = google.ai({ version: 'v1', auth: client });

    try {
        const response = await aiService.text.generate({
            requestBody: {
                prompt: `Generate captions and hashtags for the topic: ${topic}`,
                maxTokens: 50,
                temperature: 0.7,
            },
        });

        const captions = response.data.choices.map(choice => choice.text.trim());
        return captions;
    } catch (error) {
        console.error('Error generating captions:', error);
        throw new Error('Failed to generate captions');
    }
};