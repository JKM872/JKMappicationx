class SearchController {
    async handleSearch(req, res) {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        try {
            const results = await scraperService.fetchNitterSearch(query);
            const aiResponse = await aiService.generateCaptions(query);

            return res.json({
                results,
                aiCaptions: aiResponse.captions,
                aiHashtags: aiResponse.hashtags,
            });
        } catch (error) {
            console.error('Error handling search:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new SearchController();