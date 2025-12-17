import { useState } from 'react';
import {
    Sparkles,
    Copy,
    Check,
    Edit3,
    Zap,
    Lightbulb,
    Flame
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

// ============================================================================
// TEMPLATE DATA
// ============================================================================

interface ViralTemplate {
    id: string;
    name: string;
    category: string;
    template: string;
    hookFormula: string;
    example: string;
    viralScore: number;
    bestFor: string[];
}

const TEMPLATES: ViralTemplate[] = [
    {
        id: '1',
        name: 'The Contrarian Opinion',
        category: 'Engagement Bait',
        template: 'Unpopular opinion: [CONTROVERSIAL STATEMENT]\n\nHere\'s why:\n\n1. [POINT 1]\n2. [POINT 2]\n3. [POINT 3]\n\nAgree or disagree?',
        hookFormula: 'Challenge conventional wisdom',
        example: 'Unpopular opinion: Most "productivity hacks" actually make you less productive.\n\nHere\'s why:\n\n1. They add complexity to simple tasks\n2. Switching systems wastes time\n3. The best hack is actually doing the work\n\nAgree or disagree?',
        viralScore: 92,
        bestFor: ['Twitter', 'Reddit', 'Threads']
    },
    {
        id: '2',
        name: 'The Listicle Thread',
        category: 'Value Content',
        template: '[NUMBER] [THINGS] that will [BENEFIT] (Thread 🧵)\n\n1/ [ITEM 1]\n[EXPLANATION]\n\n2/ [ITEM 2]\n[EXPLANATION]\n\n...\n\nRetweet to save for later 🔁',
        hookFormula: 'Promise specific value with numbers',
        example: '10 free AI tools that will save you 10 hours/week (Thread 🧵)\n\n1/ ChatGPT\nUse it for brainstorming and first drafts\n\n2/ Notion AI\nAutomate your note-taking\n\n...\n\nRetweet to save for later 🔁',
        viralScore: 88,
        bestFor: ['Twitter', 'Threads']
    },
    {
        id: '3',
        name: 'The Personal Story',
        category: 'Storytelling',
        template: 'I [DID SOMETHING] and it changed everything.\n\nHere\'s my story:\n\n[BACKGROUND]\n\n[THE TURNING POINT]\n\n[THE LESSON]\n\n[CTA]',
        hookFormula: 'Lead with transformation',
        example: 'I quit my $200k job to build a startup.\n\nHere\'s my story:\n\nI was comfortable but unfulfilled...\n\nOne day, I realized I was building someone else\'s dream.\n\nLesson: Comfort is the enemy of growth.\n\nWhat\'s holding you back?',
        viralScore: 85,
        bestFor: ['Twitter', 'Reddit', 'Dev.to']
    },
    {
        id: '4',
        name: 'The How-To Guide',
        category: 'Educational',
        template: 'How to [ACHIEVE GOAL] in [TIMEFRAME]:\n\nStep 1: [ACTION]\n→ [DETAIL]\n\nStep 2: [ACTION]\n→ [DETAIL]\n\nStep 3: [ACTION]\n→ [DETAIL]\n\nSave this for later 📌',
        hookFormula: 'Clear outcome + timeline',
        example: 'How to grow from 0 to 10k followers in 90 days:\n\nStep 1: Pick your niche\n→ Focus on 1-2 topics only\n\nStep 2: Post 2x daily\n→ Morning and evening for max reach\n\nStep 3: Engage 30min/day\n→ Comment on 10 big accounts\n\nSave this for later 📌',
        viralScore: 86,
        bestFor: ['Twitter', 'Dev.to', 'Reddit']
    },
    {
        id: '5',
        name: 'The Behind-the-Scenes',
        category: 'Transparency',
        template: 'Here\'s what [NUMBER] [METRIC] looks like behind the scenes:\n\n[SCREENSHOT/DATA]\n\nThe reality:\n• [TRUTH 1]\n• [TRUTH 2]\n• [TRUTH 3]\n\nAsk me anything 👇',
        hookFormula: 'Reveal hidden insights',
        example: 'Here\'s what $50k/month revenue looks like behind the scenes:\n\n[Revenue screenshot]\n\nThe reality:\n• 60% goes to expenses\n• I work 70-hour weeks\n• It took 3 years to get here\n\nAsk me anything 👇',
        viralScore: 90,
        bestFor: ['Twitter', 'Reddit']
    },
    {
        id: '6',
        name: 'The Prediction',
        category: 'Thought Leadership',
        template: 'My prediction for [TOPIC] in [YEAR]:\n\n🔮 [PREDICTION 1]\n🔮 [PREDICTION 2]\n🔮 [PREDICTION 3]\n\nRemind me in 12 months.\n\nWhat\'s yours?',
        hookFormula: 'Bold future claims',
        example: 'My prediction for AI in 2025:\n\n🔮 50% of code will be AI-generated\n🔮 AI agents will handle customer support\n🔮 Every app will have AI built-in\n\nRemind me in 12 months.\n\nWhat\'s yours?',
        viralScore: 82,
        bestFor: ['Twitter', 'Threads']
    }
];

const CATEGORIES = ['All', 'Engagement Bait', 'Value Content', 'Storytelling', 'Educational', 'Transparency', 'Thought Leadership'];

// ============================================================================
// COMPONENT
// ============================================================================

export function ViralTemplates() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTemplate, setSelectedTemplate] = useState<ViralTemplate | null>(null);
    const [customContent, setCustomContent] = useState('');
    const [copied, setCopied] = useState(false);

    const filteredTemplates = selectedCategory === 'All'
        ? TEMPLATES
        : TEMPLATES.filter(t => t.category === selectedCategory);

    const handleUseTemplate = (template: ViralTemplate) => {
        setSelectedTemplate(template);
        setCustomContent(template.example);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'from-green-500 to-emerald-500';
        if (score >= 80) return 'from-yellow-500 to-amber-500';
        return 'from-orange-500 to-red-500';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-orange-400" />
                        Viral Templates
                    </h1>
                    <p className="text-gray-400 mt-1">Proven formulas for viral content</p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((category) => (
                    <Button
                        key={category}
                        variant={selectedCategory === category ? 'gradient' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </Button>
                ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                    <Card key={template.id} variant="glass" hover className="group">
                        <CardContent>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                                        {template.name}
                                    </h3>
                                    <Badge variant="purple" size="sm" className="mt-1">
                                        {template.category}
                                    </Badge>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getScoreColor(template.viralScore)} text-white flex items-center gap-1`}>
                                    <Flame className="w-3 h-3" />
                                    {template.viralScore}%
                                </div>
                            </div>

                            {/* Hook Formula */}
                            <div className="mb-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <p className="text-xs text-purple-400 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Hook Formula: {template.hookFormula}
                                </p>
                            </div>

                            {/* Template Preview */}
                            <div className="bg-black/30 rounded-lg p-3 mb-3 text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {template.template}
                            </div>

                            {/* Best For */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs text-gray-500">Best for:</span>
                                {template.bestFor.map(platform => (
                                    <Badge key={platform} variant="default" size="sm">{platform}</Badge>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<Edit3 className="w-4 h-4" />}
                                    onClick={() => handleUseTemplate(template)}
                                    className="flex-1"
                                >
                                    Use Template
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    onClick={() => handleCopy(template.example)}
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Template Editor Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
                    <Card variant="premium" className="w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e?.stopPropagation()}>
                        <CardHeader action={
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>✕</Button>
                        }>
                            <CardTitle>
                                <Edit3 className="w-5 h-5 inline mr-2" />
                                Customize: {selectedTemplate.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Template Structure */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                    Template Structure
                                </label>
                                <div className="bg-black/30 rounded-lg p-3 text-sm text-gray-400 font-mono whitespace-pre-wrap">
                                    {selectedTemplate.template}
                                </div>
                            </div>

                            {/* Editable Content */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                    Your Content
                                </label>
                                <textarea
                                    value={customContent}
                                    onChange={(e) => setCustomContent(e.target.value)}
                                    className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                                    placeholder="Customize the template..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="primary"
                                    leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    onClick={() => handleCopy(customContent)}
                                    className="flex-1"
                                >
                                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                                </Button>
                                <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
