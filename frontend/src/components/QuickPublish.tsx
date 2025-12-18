import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Newspaper,
  Clipboard,
  FileText,
  Upload,
  Zap,
  Waves,
  Terminal,
  Package,
  BarChart3,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useToast } from './ui/Toast';

interface Platform {
  name: string;
  type: 'article' | 'paste' | 'file';
  maxSize: number;
  features: string[];
}

interface PublishResult {
  platform: string;
  success: boolean;
  url?: string;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const QuickPublish: React.FC = () => {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [_platforms, setPlatforms] = useState<Platform[]>([]); // Fetched for future dynamic use
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['telegraph', 'dpaste']);
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<PublishResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch available platforms
  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const res = await fetch(`${API_URL}/api/publish/status`);
      const data = await res.json();
      setPlatforms(data.platforms || []);
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      toastWarning('Wpisz treść do opublikowania!');
      return;
    }

    setPublishing(true);
    setResults([]);
    setShowResults(true);

    try {
      const res = await fetch(`${API_URL}/api/publish/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          title: title.trim() || 'Mój post',
          platforms: selectedPlatforms,
        }),
      });

      const data = await res.json();

      if (data.results) {
        setResults(data.results);
        const successCount = data.results.filter((r: PublishResult) => r.success).length;
        if (successCount > 0) {
          toastSuccess(`Opublikowano na ${successCount} platformach!`);
        } else {
          toastError('Nie udało się opublikować na żadnej platformie');
        }
      }
    } catch (error: any) {
      toastError(error.message || 'Wystąpił błąd podczas publikacji');
      setResults([{
        platform: 'all',
        success: false,
        error: error.message || 'Wystąpił błąd',
      }]);
    } finally {
      setPublishing(false);
    }
  };

  const handleSinglePublish = async (platform: string) => {
    if (!content.trim()) {
      toastWarning('Wpisz treść do opublikowania!');
      return;
    }

    setPublishing(true);
    setShowResults(true);

    try {
      const res = await fetch(`${API_URL}/api/publish/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          title: title.trim() || 'Mój post',
        }),
      });

      const data = await res.json();

      setResults(prev => [...prev, {
        platform,
        success: data.success,
        url: data.url,
        error: data.error,
      }]);
    } catch (error: any) {
      setResults(prev => [...prev, {
        platform,
        success: false,
        error: error.message,
      }]);
    } finally {
      setPublishing(false);
    }
  };

  const platformIcons: Record<string, React.ReactNode> = {
    telegraph: <Newspaper className="w-4 h-4" />,
    dpaste: <Clipboard className="w-4 h-4" />,
    rentry: <FileText className="w-4 h-4" />,
    pasters: <Terminal className="w-4 h-4" />,
    '0x0': <Upload className="w-4 h-4" />,
    hastebin: <Zap className="w-4 h-4" />,
    sprunge: <Waves className="w-4 h-4" />,
    termbin: <Terminal className="w-4 h-4" />,
    catbox: <Package className="w-4 h-4" />,
  };

  const platformColors: Record<string, string> = {
    telegraph: 'bg-blue-500 hover:bg-blue-600',
    dpaste: 'bg-green-500 hover:bg-green-600',
    rentry: 'bg-purple-500 hover:bg-purple-600',
    pasters: 'bg-orange-500 hover:bg-orange-600',
    '0x0': 'bg-red-500 hover:bg-red-600',
    hastebin: 'bg-yellow-500 hover:bg-yellow-600',
    sprunge: 'bg-teal-500 hover:bg-teal-600',
    termbin: 'bg-gray-600 hover:bg-gray-700',
    catbox: 'bg-pink-500 hover:bg-pink-600',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Rocket className="w-6 h-6 text-purple-400" />
        Szybka Publikacja
        <span className="text-sm font-normal text-green-400 ml-2">
          (Bez logowania!)
        </span>
      </h2>

      {/* Info box */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
        <p className="text-sm text-gray-300">
          📢 Opublikuj treść natychmiast na wielu platformach bez logowania!
          Każda platforma zwróci unikalny link do Twojego posta.
        </p>
      </div>

      {/* Title input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Tytuł (opcjonalny)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Mój niesamowity post..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Content textarea */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Treść *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Wpisz treść swojego posta... 
          
Możesz użyć Markdown:
# Nagłówek
**pogrubienie**
*kursywa*
- lista
- elementy

```kod```"
          rows={8}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <div className="text-xs text-gray-400 mt-1">
          {content.length} znaków
        </div>
      </div>

      {/* Platform selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Wybierz platformy
        </label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {['telegraph', 'dpaste', 'rentry', 'hastebin', 'sprunge', '0x0', 'catbox', 'pasters', 'termbin'].map(platform => (
            <button
              key={platform}
              onClick={() => togglePlatform(platform)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedPlatforms.includes(platform)
                ? `${platformColors[platform]} text-white ring-2 ring-white/30`
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              {platformIcons[platform]} {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Publish buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handlePublish}
          disabled={publishing || selectedPlatforms.length === 0}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all ${publishing || selectedPlatforms.length === 0
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
        >
          {publishing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Publikuję...
            </span>
          ) : (
            `🚀 Publikuj na ${selectedPlatforms.length} platformach`
          )}
        </button>
      </div>

      {/* Quick single platform buttons */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <p className="text-xs text-gray-400 mb-2">Szybka publikacja na jednej platformie:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(platformIcons).map(([platform, icon]) => (
            <button
              key={platform}
              onClick={() => handleSinglePublish(platform)}
              disabled={publishing}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${platformColors[platform]} text-white disabled:opacity-50`}
            >
              {icon} {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {showResults && results.length > 0 && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Wyniki publikacji
            <button
              onClick={() => { setResults([]); setShowResults(false); }}
              className="text-xs text-gray-400 hover:text-white ml-auto flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Zamknij
            </button>
          </h3>
          <div className="space-y-2">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${result.success
                  ? 'bg-green-900/30 border border-green-700'
                  : 'bg-red-900/30 border border-red-700'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">
                    {platformIcons[result.platform] || '📄'} {result.platform}
                  </span>
                  <span className={`flex items-center gap-1 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {result.success ? 'Opublikowano' : 'Błąd'}
                  </span>
                </div>
                {result.success && result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm mt-1 block truncate"
                  >
                    🔗 {result.url}
                  </a>
                )}
                {!result.success && result.error && (
                  <p className="text-red-300 text-sm mt-1">{result.error}</p>
                )}
              </div>
            ))}
          </div>

          {/* Copy all links */}
          {results.some(r => r.success && r.url) && (
            <button
              onClick={() => {
                const links = results
                  .filter(r => r.success && r.url)
                  .map(r => `${r.platform}: ${r.url}`)
                  .join('\n');
                navigator.clipboard.writeText(links);
                alert('Skopiowano wszystkie linki!');
              }}
              className="mt-3 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-all"
            >
              📋 Kopiuj wszystkie linki
            </button>
          )}
        </div>
      )}

      {/* Platform info */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <details className="text-sm">
          <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
            ℹ️ Informacje o platformach
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
            <div className="p-2 bg-gray-700/50 rounded">
              <strong className="text-blue-400">Telegraph</strong> - Artykuły z formatowaniem HTML/Markdown
            </div>
            <div className="p-2 bg-gray-700/50 rounded">
              <strong className="text-green-400">Dpaste</strong> - Pastebin dla kodu, 7 dni ważności
            </div>
            <div className="p-2 bg-gray-700/50 rounded">
              <strong className="text-purple-400">Rentry</strong> - Markdown pastebin, edytowalny
            </div>
            <div className="p-2 bg-gray-700/50 rounded">
              <strong className="text-yellow-400">Hastebin</strong> - Szybki pastebin dla kodu
            </div>
            <div className="p-2 bg-gray-700/50 rounded">
              <strong className="text-red-400">0x0.st</strong> - Upload plików do 512MB
            </div>
            <div className="p-2 bg-gray-700/50 rounded">
              <strong className="text-pink-400">Catbox</strong> - Hosting plików do 200MB
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default QuickPublish;
