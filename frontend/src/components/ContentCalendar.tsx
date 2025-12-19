import { useState, useEffect } from 'react';
import { PlannedPost } from '../types';
import {
  Globe,
  Sparkles,
  RefreshCw,
  Calendar,
  Pencil,
  Trash2
} from 'lucide-react';
import { XIcon, RedditIcon, ThreadsIcon, DevToIcon } from './ui/IconSystem';
import { useToast } from './ui/Toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface PostEditorProps {
  post?: PlannedPost | null;
  originalContent?: string;
  onSave: (post: Partial<PlannedPost>) => void;
  onClose: () => void;
}

export function PostEditor({ post, originalContent, onSave, onClose }: PostEditorProps) {
  const [content, setContent] = useState(post?.content || originalContent || '');
  const [platform, setPlatform] = useState<PlannedPost['platform']>(post?.platform || 'all');
  const [scheduledDate, setScheduledDate] = useState(
    post?.scheduled_date ? new Date(post.scheduled_date).toISOString().slice(0, 16) : ''
  );
  const [status, setStatus] = useState<PlannedPost['status']>(post?.status || 'draft');
  const [hashtags, setHashtags] = useState(post?.hashtags?.join(' ') || '');
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixedVariations, setRemixedVariations] = useState<any[]>([]);

  const platforms: { id: PlannedPost['platform']; name: string; icon: React.ReactNode }[] = [
    { id: 'all', name: 'All Platforms', icon: <Globe className="w-5 h-5" /> },
    { id: 'Twitter', name: 'Twitter/X', icon: <XIcon className="w-5 h-5" /> },
    { id: 'Reddit', name: 'Reddit', icon: <RedditIcon className="w-5 h-5" /> },
    { id: 'Dev.to', name: 'Dev.to', icon: <DevToIcon className="w-5 h-5" /> },
    { id: 'Threads', name: 'Threads', icon: <ThreadsIcon className="w-5 h-5" /> },
  ];

  const handleRemix = async () => {
    if (!content.trim()) return;

    setIsRemixing(true);
    try {
      const response = await fetch(`${API_BASE}/api/remix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platform, tone: 'engaging' })
      });

      const data = await response.json();
      if (data.success && data.data?.variations) {
        setRemixedVariations(data.data.variations);
      }
    } catch (err) {
      console.error('Remix error:', err);
    } finally {
      setIsRemixing(false);
    }
  };

  const handleSelectVariation = (variation: any) => {
    setContent(variation.text);
    setHashtags(variation.hashtags?.join(' ') || '');
    setRemixedVariations([]);
  };

  const handleSave = () => {
    const hashtagArray = hashtags
      .split(/[\s,]+/)
      .filter(tag => tag.startsWith('#') || tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

    onSave({
      content,
      platform,
      scheduled_date: scheduledDate || undefined,
      status,
      hashtags: hashtagArray.length > 0 ? hashtagArray : undefined,
      original_content: originalContent
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#15202b] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="sticky top-0 bg-[#15202b] border-b border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{post ? 'Edit Post' : 'Create Planned Post'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Content Editor */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-[#1d9bf0] focus:outline-none resize-none"
              rows={5}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{content.length} characters</span>
              <button
                onClick={handleRemix}
                disabled={isRemixing || !content.trim()}
                className="text-[#1d9bf0] hover:underline disabled:opacity-50"
              >
                {isRemixing ? <><RefreshCw className="w-3 h-3 inline animate-spin mr-1" />Remixing...</> : <><Sparkles className="w-3 h-3 inline mr-1" />AI Remix</>}
              </button>
            </div>
          </div>

          {/* Remixed Variations */}
          {remixedVariations.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">AI Variations</h3>
              <div className="space-y-3">
                {remixedVariations.map((variation, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectVariation(variation)}
                    className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors border border-transparent hover:border-[#1d9bf0]"
                  >
                    <p className="text-sm text-white mb-2">{variation.text}</p>
                    <p className="text-xs text-gray-500">{variation.reason}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {variation.hashtags?.slice(0, 5).map((tag: string, i: number) => (
                        <span key={i} className="text-xs text-[#1d9bf0]">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Target Platform</label>
            <div className="grid grid-cols-5 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-3 rounded-xl border transition-colors text-center ${platform === p.id
                    ? 'bg-[#1d9bf0] border-[#1d9bf0] text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                >
                  <span className="text-xl block mb-1">{p.icon}</span>
                  <span className="text-xs">{p.name.split('/')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Schedule Date (Optional)</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-[#1d9bf0] focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Status</label>
            <div className="flex gap-2">
              {(['draft', 'scheduled', 'published'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${status === s
                    ? s === 'draft' ? 'bg-gray-600 text-white' :
                      s === 'scheduled' ? 'bg-yellow-600 text-white' :
                        'bg-green-600 text-white'
                    : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-600'
                    }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#hashtag1 #hashtag2 #hashtag3"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:border-[#1d9bf0] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-full border border-gray-700 text-gray-300 font-semibold hover:bg-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="flex-1 py-3 px-6 rounded-full bg-[#1d9bf0] text-white font-semibold hover:bg-[#1a8cd8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {post ? 'Update' : 'Save'} Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentCalendar() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [plannedPosts, setPlannedPosts] = useState<PlannedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<PlannedPost | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('limit', '50');

      const response = await fetch(`${API_BASE}/api/plan/list?${params}`);
      const data = await response.json();

      if (data.success) {
        setPlannedPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching planned posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const handleSavePost = async (postData: Partial<PlannedPost>) => {
    try {
      const url = editingPost
        ? `${API_BASE}/api/plan/${editingPost.id}`
        : `${API_BASE}/api/plan/create`;

      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      const data = await response.json();

      if (data.success) {
        setShowEditor(false);
        setEditingPost(null);
        fetchPosts();
        toastSuccess(editingPost ? 'Post zaktualizowany!' : 'Post zapisany!');
      } else {
        toastError('Nie udało się zapisać posta');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      toastError('Błąd przy zapisywaniu posta');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/plan/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchPosts();
        toastSuccess('Post usunięty!');
      } else {
        toastError('Nie udało się usunąć posta');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      toastError('Błąd przy usuwaniu posta');
    }
  };

  const getPlatformIcon = (platform: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      Twitter: <XIcon className="w-5 h-5" />,
      Reddit: <RedditIcon className="w-5 h-5" />,
      'Dev.to': <DevToIcon className="w-5 h-5" />,
      Threads: <ThreadsIcon className="w-5 h-5" />,
      all: <Globe className="w-5 h-5" />
    };
    return icons[platform] || <Globe className="w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-600';
      case 'scheduled': return 'bg-yellow-600';
      case 'published': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="w-5 h-5" /> Content Calendar</h2>
            <button
              onClick={() => {
                setEditingPost(null);
                setShowEditor(true);
              }}
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-semibold py-2 px-4 rounded-full transition-colors"
            >
              + New Post
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'draft', 'scheduled', 'published'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === f
                  ? 'bg-[#1d9bf0] text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d9bf0]"></div>
          </div>
        ) : plannedPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="flex justify-center mb-4"><Calendar className="w-16 h-16 text-gray-600" /></div>
            <p className="text-lg font-semibold mb-2">No planned posts yet</p>
            <p className="text-sm mb-4">Create your first post to get started</p>
            <button
              onClick={() => {
                setEditingPost(null);
                setShowEditor(true);
              }}
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-semibold py-2 px-6 rounded-full transition-colors"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plannedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setShowEditor(true);
                      }}
                      className="text-gray-400 hover:text-[#1d9bf0] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-white mb-3 line-clamp-3">{post.content}</p>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.hashtags.slice(0, 5).map((tag, i) => (
                      <span key={i} className="text-xs text-[#1d9bf0]">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.scheduled_date)}</span>
                  <span>Created {new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Editor Modal */}
      {showEditor && (
        <PostEditor
          post={editingPost}
          onSave={handleSavePost}
          onClose={() => {
            setShowEditor(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
}

