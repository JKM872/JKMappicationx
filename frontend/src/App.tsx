import { useState, useRef, useEffect } from 'react';
import { SearchBar, SearchBarHandle } from './components/SearchBar';
import { TweetCard } from './components/TweetCard';
import { CaptionGenerator } from './components/CaptionGenerator';
import { ContentCalendar, PostEditor } from './components/ContentCalendar';
import { AlgorithmSimulator } from './components/AlgorithmSimulator';
import { RewritePanel } from './components/RewritePanel';
import { AutomationSettings } from './components/AutomationSettings';
import { AudienceInsights } from './components/AudienceInsights';
import { AuthorGrowthTracker } from './components/AuthorGrowthTracker';
import { UndervaluedPosts } from './components/UndervaluedPosts';
import { ViralityPredictor } from './components/ViralityPredictor';
import { TopicTags } from './components/TopicTags';
import { AutoRepostPanel } from './components/AutoRepostPanel';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { ViralTemplates } from './components/ViralTemplates';
import { EngagementHeatmap } from './components/EngagementHeatmap';
import { CompetitorAnalysis } from './components/CompetitorAnalysis';
import { SchedulerDashboard } from './components/SchedulerDashboard';
import QuickPublish from './components/QuickPublish';
import { Post } from './types';
import {
  Rocket,
  Search,
  Target,
  BarChart3,
  Sparkles,
  Hash,
  TrendingUp,
  Flame,
  Globe2,
  Twitter,
  MessageCircle,
  BookOpen,
  PenTool,
  Settings,
  Gem,
  Zap,
  RefreshCw,
  Clock
} from 'lucide-react';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortBy] = useState<'popular' | 'newest'>('popular');
  const [activeView, setActiveView] = useState<'discover' | 'calendar' | 'simulator' | 'automation' | 'insights' | 'author-growth' | 'hidden-gems' | 'virality' | 'auto-repost' | 'performance' | 'templates' | 'heatmap' | 'competitors' | 'scheduler' | 'quick-publish'>('discover');
  const [showRewritePanel, setShowRewritePanel] = useState(false);
  const [rewriteContent, setRewriteContent] = useState('');
  const [selectedTopicTag, setSelectedTopicTag] = useState<string>('');
  const searchBarRef = useRef<SearchBarHandle>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K -> Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setActiveView('discover');
        // Small timeout to allow render
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"]');
          if (searchInput) (searchInput as HTMLElement).focus();
        }, 100);
      }
      // Ctrl+P -> Quick Publish
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setActiveView('quick-publish');
      }
      // Ctrl+S -> Scheduler
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setActiveView('scheduler');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });


  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setShowCaptionModal(true);
  };

  const handlePlanPost = (post: Post) => {
    setSelectedPost(post);
    setShowPlanModal(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative">
      {/* Main Container - adjusted for fixed sidebar */}
      <div className="max-w-[1280px] mx-auto flex relative z-10 ml-[240px]">

        {/* Left Sidebar - Minimal Design */}
        <div className="sidebar-minimal sticky top-0 flex-shrink-0 border-r border-white/5">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="sidebar-logo-text">Viral Hunter</span>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1">
            {/* Content Discovery */}
            <button
              onClick={() => setActiveView('discover')}
              className={`sidebar-nav-item w-full ${activeView === 'discover' ? 'active' : ''}`}
            >
              <Search className="sidebar-icon" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => setShowCaptionModal(true)}
              className="sidebar-nav-item w-full"
            >
              <Sparkles className="sidebar-icon" />
              <span>Inspiration</span>
            </button>

            <button
              onClick={() => setActiveView('calendar')}
              className={`sidebar-nav-item w-full ${activeView === 'calendar' ? 'active' : ''}`}
            >
              <BookOpen className="sidebar-icon" />
              <span>Library</span>
            </button>

            <button
              onClick={() => setActiveView('insights')}
              className={`sidebar-nav-item w-full ${activeView === 'insights' ? 'active' : ''}`}
            >
              <BarChart3 className="sidebar-icon" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setShowCaptionModal(true)}
              className="sidebar-nav-item w-full"
            >
              <PenTool className="sidebar-icon" />
              <span>Content Studio</span>
            </button>

            <div className="sidebar-divider" />

            {/* Growth Analytics Section */}
            <div className="sidebar-section-title">Growth Analytics</div>

            <button
              onClick={() => setActiveView('author-growth')}
              className={`sidebar-nav-item w-full ${activeView === 'author-growth' ? 'active' : ''}`}
            >
              <TrendingUp className="sidebar-icon" />
              <span>Author Growth</span>
            </button>

            <button
              onClick={() => setActiveView('hidden-gems')}
              className={`sidebar-nav-item w-full ${activeView === 'hidden-gems' ? 'active' : ''}`}
            >
              <Gem className="sidebar-icon" />
              <span>Hidden Gems</span>
            </button>

            <button
              onClick={() => setActiveView('virality')}
              className={`sidebar-nav-item w-full ${activeView === 'virality' ? 'active' : ''}`}
            >
              <Zap className="sidebar-icon" />
              <span>Virality AI</span>
            </button>

            <div className="sidebar-divider" />

            {/* Platforms Section */}
            <div className="sidebar-section-title">Platforms</div>

            <button
              onClick={() => setSelectedPlatform('all')}
              className={`sidebar-nav-item w-full ${selectedPlatform === 'all' ? 'active' : ''}`}
            >
              <Globe2 className="sidebar-icon" />
              <span>All Platforms</span>
            </button>

            <button
              onClick={() => setSelectedPlatform('twitter')}
              className={`sidebar-nav-item w-full ${selectedPlatform === 'twitter' ? 'active' : ''}`}
            >
              <Twitter className="sidebar-icon" />
              <span>Twitter / X</span>
            </button>

            <button
              onClick={() => setSelectedPlatform('reddit')}
              className={`sidebar-nav-item w-full ${selectedPlatform === 'reddit' ? 'active' : ''}`}
            >
              <MessageCircle className="sidebar-icon" />
              <span>Reddit</span>
            </button>

            <div className="sidebar-divider" />

            {/* Tools Section */}
            <div className="sidebar-section-title">Tools</div>

            <button
              onClick={() => setActiveView('simulator')}
              className={`sidebar-nav-item w-full ${activeView === 'simulator' ? 'active' : ''}`}
            >
              <Target className="sidebar-icon" />
              <span>Algorithm Lab</span>
            </button>

            <button
              onClick={() => setActiveView('automation')}
              className={`sidebar-nav-item w-full ${activeView === 'automation' ? 'active' : ''}`}
            >
              <Settings className="sidebar-icon" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setActiveView('auto-repost')}
              className={`sidebar-nav-item w-full ${activeView === 'auto-repost' ? 'active' : ''}`}
            >
              <RefreshCw className="sidebar-icon" />
              <span>Auto-Repost</span>
            </button>

            <div className="sidebar-divider" />

            {/* New Features */}
            <div className="sidebar-section-title">Analytics</div>

            <button
              onClick={() => setActiveView('performance')}
              className={`sidebar-nav-item w-full ${activeView === 'performance' ? 'active' : ''}`}
            >
              <BarChart3 className="sidebar-icon" />
              <span>Performance</span>
            </button>

            <button
              onClick={() => setActiveView('heatmap')}
              className={`sidebar-nav-item w-full ${activeView === 'heatmap' ? 'active' : ''}`}
            >
              <Flame className="sidebar-icon" />
              <span>Heatmap</span>
            </button>

            <button
              onClick={() => setActiveView('templates')}
              className={`sidebar-nav-item w-full ${activeView === 'templates' ? 'active' : ''}`}
            >
              <Sparkles className="sidebar-icon" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActiveView('competitors')}
              className={`sidebar-nav-item w-full ${activeView === 'competitors' ? 'active' : ''}`}
            >
              <Target className="sidebar-icon" />
              <span>Competitors</span>
            </button>

            <button
              onClick={() => setActiveView('scheduler')}
              className={`sidebar-nav-item w-full ${activeView === 'scheduler' ? 'active' : ''}`}
            >
              <Clock className="w-5 h-5 mr-3" />
              <span>Scheduler</span>
              <span className="ml-auto text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">Ctrl+S</span>
            </button>

            <button
              onClick={() => setActiveView('quick-publish')}
              className={`sidebar-nav-item w-full ${activeView === 'quick-publish' ? 'active' : ''}`}
            >
              <Zap className="sidebar-icon" />
              <span>Quick Publish</span>
              <span className="ml-auto text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">Ctrl+P</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            <p className="text-xs text-gray-500 opacity-70">Made with ❤️ for creators</p>
            <p className="text-xs text-gray-600 mt-1 opacity-50">Powered by AI</p>
          </div>
        </div>

        {/* Center Feed */}
        <div className="flex-1 border-r border-white/5 max-w-[600px]">{activeView === 'discover' ? (
          <>
            {/* Header with Search - Glass Effect */}
            <div className="sticky top-0 z-10 glass-panel border-b border-white/5">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Discover Viral Content
                </h2>
                <SearchBar ref={searchBarRef} onResults={setPosts} platform={selectedPlatform} />
              </div>
              {/* Topic Tags */}
              <TopicTags
                onTagClick={(tag) => {
                  setSelectedTopicTag(tag);
                  if (tag && searchBarRef.current) {
                    searchBarRef.current.triggerSearch(tag);
                  }
                }}
                selectedTag={selectedTopicTag}
              />
            </div>

            {/* Feed */}
            <div className="divide-y divide-gray-800">
              {(() => {
                // Sort posts based on selected option
                const sortedPosts = [...posts].sort((a, b) => {
                  if (sortBy === 'popular') {
                    return (b.score || 0) - (a.score || 0);
                  } else {
                    const timeA = new Date(a.timestamp || 0).getTime();
                    const timeB = new Date(b.timestamp || 0).getTime();
                    return timeB - timeA;
                  }
                });

                return sortedPosts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-lg font-semibold mb-2">Find trending posts</p>
                    <p className="text-sm">Search for topics like "AI", "javascript", or "React"</p>
                  </div>
                ) : (
                  sortedPosts.map((post) => (
                    <TweetCard
                      key={post.id || Math.random()}
                      post={post}
                      onSelect={handleSelectPost}
                      onPlan={handlePlanPost}
                    />
                  ))
                );
              })()}
            </div>
          </>
        ) : activeView === 'calendar' ? (
          <ContentCalendar />
        ) : activeView === 'simulator' ? (
          <AlgorithmSimulator />
        ) : activeView === 'automation' ? (
          <AutomationSettings />
        ) : activeView === 'author-growth' ? (
          <AuthorGrowthTracker />
        ) : activeView === 'hidden-gems' ? (
          <UndervaluedPosts />
        ) : activeView === 'virality' ? (
          <ViralityPredictor />
        ) : activeView === 'auto-repost' ? (
          <AutoRepostPanel />
        ) : activeView === 'performance' ? (
          <PerformanceDashboard />
        ) : activeView === 'heatmap' ? (
          <EngagementHeatmap />
        ) : activeView === 'templates' ? (
          <ViralTemplates />
        ) : activeView === 'competitors' ? (
          <CompetitorAnalysis />
        ) : activeView === 'scheduler' ? (
          <SchedulerDashboard />
        ) : activeView === 'quick-publish' ? (
          <QuickPublish />
        ) : (
          <AudienceInsights />
        )}
        </div>

        {/* Right Sidebar - Trending / Info */}
        <div className="w-[350px] flex-shrink-0 p-4 hidden xl:block">
          <div className="glass-premium p-5 rounded-2xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="animated-gradient-text">What's happening</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="hover:bg-white/5 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-purple-500/30 group">
                <p className="text-gray-500 text-xs flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Trending in Tech
                </p>
                <p className="font-semibold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  <Hash className="w-4 h-4" />AI
                </p>
                <p className="text-gray-500 text-xs mt-1">15.2K posts</p>
              </div>
              <div className="hover:bg-white/5 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-blue-500/30 group">
                <p className="text-gray-500 text-xs flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Development
                </p>
                <p className="font-semibold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1">
                  <Hash className="w-4 h-4" />JavaScript
                </p>
                <p className="text-gray-500 text-xs mt-1">8.7K posts</p>
              </div>
              <div className="hover:bg-white/5 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30 group">
                <p className="text-gray-500 text-xs flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Programming
                </p>
                <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                  <Hash className="w-4 h-4" />Python
                </p>
                <p className="text-gray-500 text-xs mt-1">12.1K posts</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="glass-card p-4 rounded-xl mt-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                <p className="text-2xl font-bold text-purple-400">{posts.length}</p>
                <p className="text-xs text-gray-500">Posts Found</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <p className="text-2xl font-bold text-blue-400">4</p>
                <p className="text-xs text-gray-500">Platforms</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption Generator Modal */}
      {showCaptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15202b] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="sticky top-0 bg-[#15202b] border-b border-gray-800 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Generate AI Caption</h2>
              <button
                onClick={() => setShowCaptionModal(false)}
                className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <CaptionGenerator
                selectedPost={selectedPost?.content || ''}
              />
            </div>
          </div>
        </div>
      )}

      {/* Plan/Remix Post Modal */}
      {showPlanModal && (
        <PostEditor
          originalContent={selectedPost?.content || selectedPost?.title || ''}
          onSave={async (postData) => {
            try {
              const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
              const response = await fetch(`${API_BASE}/api/plan/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...postData,
                  original_post_id: selectedPost?.id,
                  original_content: selectedPost?.content || selectedPost?.title
                })
              });
              const data = await response.json();
              if (data.success) {
                setShowPlanModal(false);
                setSelectedPost(null);
                // Optionally switch to calendar view
                setActiveView('calendar');
              }
            } catch (err) {
              console.error('Error saving planned post:', err);
            }
          }}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedPost(null);
          }}
        />
      )}

      {/* Rewrite Panel Modal */}
      {showRewritePanel && rewriteContent && (
        <RewritePanel
          content={rewriteContent}
          onSelectVariation={(text) => {
            navigator.clipboard.writeText(text);
            setShowRewritePanel(false);
            setRewriteContent('');
          }}
          onClose={() => {
            setShowRewritePanel(false);
            setRewriteContent('');
          }}
        />
      )}
    </div>
  );
}

export default App;
