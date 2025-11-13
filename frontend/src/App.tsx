import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultsList } from './components/ResultsList';
import { CaptionGenerator } from './components/CaptionGenerator';
import { Dashboard } from './components/Dashboard';
import { Post } from './types';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'generate' | 'monitor'>('search');

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setActiveTab('generate');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            🚀 Viral Content Hunter
          </h1>
          <p className="text-white/90 text-lg">
            Find viral posts · Generate AI captions · Monitor engagement
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white/10 backdrop-blur-sm p-2 rounded-lg">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-white hover:bg-white/20'
            }`}
          >
            🔍 Search Posts
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'generate'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-white hover:bg-white/20'
            }`}
          >
            🎨 Generate Content
          </button>
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'monitor'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-white hover:bg-white/20'
            }`}
          >
            📊 Monitor
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
          {activeTab === 'search' && (
            <div>
              <SearchBar onResults={setPosts} />
              
              {posts.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      🔥 Top {posts.length} Viral Posts
                    </h2>
                    <span className="text-sm text-gray-500">
                      Click a post to generate content
                    </span>
                  </div>
                  <ResultsList posts={posts} onSelectPost={handleSelectPost} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'generate' && (
            <CaptionGenerator
              selectedPost={selectedPost?.content || ''}
            />
          )}

          {activeTab === 'monitor' && (
            <Dashboard postId={selectedPost?.postUrl} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/70 text-sm">
          <p>
            Made with ❤️ for zero-budget creators ·{' '}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              View on GitHub
            </a>
          </p>
          <p className="mt-2 text-xs">
            Powered by Google AI · Nitter · Supabase
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
