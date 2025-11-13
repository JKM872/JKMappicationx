import axios from 'axios';
import cheerio from 'cheerio';
import { Post } from '../types';

export const fetchNitterSearch = async (query: string): Promise<Post[]> => {
    const url = `https://nitter.net/search?f=top&q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const posts: Post[] = [];

    $('.tweet').each((_, element) => {
        const post: Post = {
            id: $(element).attr('data-id'),
            content: $(element).find('.tweet-content').text(),
            author: $(element).find('.username').text(),
            date: $(element).find('.date').attr('title'),
            metrics: {
                likes: parseInt($(element).find('.likes').text()) || 0,
                retweets: parseInt($(element).find('.retweets').text()) || 0,
            },
        };
        posts.push(post);
    });

    return posts;
};