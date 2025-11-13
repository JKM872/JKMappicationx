export interface Post {
    id: string;
    title: string;
    content: string;
    author: string;
    date: string;
    metrics: {
        likes: number;
        shares: number;
        comments: number;
    };
}

export interface SearchResult {
    posts: Post[];
    totalResults: number;
}

export interface AIResponse {
    captions: string[];
    hashtags: string[];
}