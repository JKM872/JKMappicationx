import { useState } from 'react';
import axios from 'axios';
import { CaptionVariation } from '../types';

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

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🎨 AI Caption Generator
      </h2>

      <div className="space-y-4">
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic or Content
          </label>
          <textarea
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setError('');
            }}
            placeholder="Paste or type the topic you want to create captions for..."
            className="w-full p-3 border border-gray-300 rounded-lg h-24 text-sm focus:border-blue-500 focus:outline-none resize-none"
            disabled={loading}
          />
        </div>

        {/* Tone Selector */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            >
              <option value="engaging">✨ Engaging</option>
              <option value="funny">😄 Funny</option>
              <option value="informative">📚 Informative</option>
              <option value="inspirational">💪 Inspirational</option>
              <option value="professional">💼 Professional</option>
              <option value="casual">😎 Casual</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {loading ? 'Generating...' : '✨ Generate'}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded border border-red-200">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Generated Captions */}
      {captions.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-gray-700 mb-3">
            Generated Variations:
          </h3>
          {captions.map((caption, idx) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Variation {idx + 1}
                </span>
                <button
                  onClick={() => copyToClipboard(caption.text, caption.hashtags)}
                  className="text-xs text-gray-600 hover:text-gray-800 bg-white px-3 py-1 rounded border border-gray-200 hover:border-gray-300 transition-all"
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              </div>

              <p className="font-medium text-gray-800 mb-2 text-sm leading-relaxed">
                {caption.text}
              </p>

              <div className="flex flex-wrap gap-1 mb-2">
                {caption.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-600 italic">
                💡 {caption.reason}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-6 text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Generating creative captions...</p>
        </div>
      )}
    </div>
  );
}
