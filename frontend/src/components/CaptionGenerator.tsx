import { useState } from 'react';
import axios from 'axios';
import { CaptionVariation } from '../types';
import {
  Sparkles,
  Smile,
  BookOpen,
  Zap,
  Briefcase,
  Coffee,
  AlertCircle,
  Palette,
  Clipboard,
  Lightbulb
} from 'lucide-react';

interface CaptionGeneratorProps {
  selectedPost?: string;
}

export function CaptionGenerator({ selectedPost }: CaptionGeneratorProps) {
  const [topic, setTopic] = useState(selectedPost || '');
  const [tone, setTone] = useState('engaging');
  const [captions, setCaptions] = useState<CaptionVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.post(`${apiUrl}/api/generate-captions`, {
        topic,
        tone,
      });

      if (res.data.success) {
        setCaptions(res.data.data.variations);
      } else {
        setError('Failed to generate captions');
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Failed to generate captions. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, hashtags: string[]) => {
    const fullText = `${text}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
  };

  const tones = [
    { value: 'engaging', label: 'Engaging', color: 'from-purple-500 to-pink-500', icon: Sparkles },
    { value: 'funny', label: 'Funny', color: 'from-yellow-500 to-orange-500', icon: Smile },
    { value: 'informative', label: 'Informative', color: 'from-blue-500 to-cyan-500', icon: BookOpen },
    { value: 'inspirational', label: 'Inspirational', color: 'from-green-500 to-emerald-500', icon: Zap },
    { value: 'professional', label: 'Professional', color: 'from-slate-500 to-gray-600', icon: Briefcase },
    { value: 'casual', label: 'Casual', color: 'from-rose-500 to-red-500', icon: Coffee },
  ];

  return (
    <div className="space-y-6">
      {/* Topic Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-400 mb-2">
          Topic or Content
        </label>
        <textarea
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setError('');
          }}
          placeholder="Paste or type the topic you want to create captions for..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
          rows={4}
          disabled={loading}
        />
        <div className="text-xs text-gray-500 mt-1">{topic.length} characters</div>
      </div>

      {/* Tone Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-400 mb-3">
          Select Tone
        </label>
        <div className="grid grid-cols-3 gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              disabled={loading}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${tone === t.value
                ? `bg-gradient-to-r ${t.color} border-transparent text-white shadow-lg`
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
                }`}
            >
              <t.icon className="w-4 h-4 inline mr-1.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none shine-on-hover"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </span>
        ) : (
          <><Sparkles className="w-5 h-5 inline mr-2" />Generate AI Captions</>
        )}
      </button>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-xl border border-red-900/50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Generated Captions */}
      {captions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-300 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            Generated Variations
          </h3>
          {captions.map((caption, idx) => (
            <div
              key={idx}
              className="glass-card p-5 rounded-xl hover-lift border-gradient-hover"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full">
                  Variation {idx + 1}
                </span>
                <button
                  onClick={() => copyToClipboard(caption.text, caption.hashtags)}
                  className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 transition-all flex items-center gap-1"
                  title="Copy to clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" /> Copy
                </button>
              </div>

              <p className="font-medium text-white mb-3 text-sm leading-relaxed">
                {caption.text}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {caption.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-500 italic flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" /> {caption.reason}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-400 animated-gradient-text font-medium">Generating creative captions...</p>
        </div>
      )}
    </div>
  );
}

