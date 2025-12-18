import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, CheckCircle, AlertCircle, Repeat, Pin, Trash2, Save } from 'lucide-react';
import { useToast } from './ui/Toast';

interface AutomationSettings {
    autoRepost: {
        enabled: boolean;
        delayHours: number;
        minEngagement: number;
        maxReposts: number;
    };
    autoPlug: {
        enabled: boolean;
        threshold: number;
        ctaContent: string;
        waitMinutes: number;
    };
    autoDelete: {
        enabled: boolean;
        thresholdHours: number;
        minEngagement: number;
        excludeDrafts: boolean;
    };
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AutomationSettings() {
    const { success: toastSuccess, error: toastError } = useToast();
    const [settings, setSettings] = useState<AutomationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/automation/settings`);
            if (res.data.success) {
                setSettings(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!settings) return;

        setSaving(true);
        setMessage(null);

        try {
            const res = await axios.post(`${API_BASE}/api/automation/settings`, settings);
            if (res.data.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
                toastSuccess('Ustawienia zapisane!');
                setTimeout(() => setMessage(null), 3000);
            } else {
                toastError('Nie udało się zapisać ustawień');
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
            setMessage({ type: 'error', text: 'Failed to save settings' });
            toastError('Błąd przy zapisywaniu ustawień');
        } finally {
            setSaving(false);
        }
    };

    const resetSettings = async () => {
        setSaving(true);
        try {
            const res = await axios.post(`${API_BASE}/api/automation/settings/reset`);
            if (res.data.success) {
                setSettings(res.data.data);
                setMessage({ type: 'success', text: 'Settings reset to defaults' });
                toastSuccess('Ustawienia zresetowane!');
                setTimeout(() => setMessage(null), 3000);
            } else {
                toastError('Nie udało się zresetować ustawień');
            }
        } catch (err) {
            console.error('Failed to reset settings:', err);
            toastError('Błąd przy resetowaniu ustawień');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-2xl mx-auto text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading settings...</p>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-6 max-w-2xl mx-auto text-center">
                <div className="glass-card p-8 rounded-xl">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Failed to Load Settings</h3>
                    <p className="text-gray-400 mb-4">Could not connect to the server. Make sure the backend is running on port 3001.</p>
                    <button
                        onClick={() => { setLoading(true); fetchSettings(); }}
                        className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                    <Bot className="w-6 h-6 text-purple-400" /> Automation Settings
                </h2>
                <p className="text-gray-400 mt-1">Configure auto-repost, auto-plug, and auto-delete rules</p>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-900/20 text-green-400 border border-green-900/50'
                    : 'bg-red-900/20 text-red-400 border border-red-900/50'
                    }`}>
                    <span>{message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}</span>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                {/* Auto Repost Section */}
                <div className="glass-card p-5 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Repeat className="w-6 h-6 text-purple-400" />
                            <div>
                                <h3 className="font-bold text-white">Auto Repost</h3>
                                <p className="text-sm text-gray-400">Boost visibility with timed reposts</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSettings({
                                ...settings,
                                autoRepost: { ...settings.autoRepost, enabled: !settings.autoRepost.enabled }
                            })}
                            className={`w-14 h-7 rounded-full transition-all duration-300 relative ${settings.autoRepost.enabled ? 'bg-purple-500' : 'bg-gray-600'
                                }`}
                        >
                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${settings.autoRepost.enabled ? 'left-8' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    {settings.autoRepost.enabled && (
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Delay (hours)</label>
                                <input
                                    type="number"
                                    value={settings.autoRepost.delayHours}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        autoRepost: { ...settings.autoRepost, delayHours: parseInt(e.target.value) || 6 }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Min Engagement</label>
                                <input
                                    type="number"
                                    value={settings.autoRepost.minEngagement}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        autoRepost: { ...settings.autoRepost, minEngagement: parseInt(e.target.value) || 100 }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Max Reposts</label>
                                <input
                                    type="number"
                                    value={settings.autoRepost.maxReposts}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        autoRepost: { ...settings.autoRepost, maxReposts: parseInt(e.target.value) || 2 }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Auto Plug Section */}
                <div className="glass-card p-5 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Pin className="w-6 h-6 text-blue-400" />
                            <div>
                                <h3 className="font-bold text-white">Auto Plug</h3>
                                <p className="text-sm text-gray-400">Add CTA when posts hit engagement threshold</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSettings({
                                ...settings,
                                autoPlug: { ...settings.autoPlug, enabled: !settings.autoPlug.enabled }
                            })}
                            className={`w-14 h-7 rounded-full transition-all duration-300 relative ${settings.autoPlug.enabled ? 'bg-blue-500' : 'bg-gray-600'
                                }`}
                        >
                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${settings.autoPlug.enabled ? 'left-8' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    {settings.autoPlug.enabled && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-white/10">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Engagement Threshold</label>
                                    <input
                                        type="number"
                                        value={settings.autoPlug.threshold}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            autoPlug: { ...settings.autoPlug, threshold: parseInt(e.target.value) || 500 }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Wait (minutes)</label>
                                    <input
                                        type="number"
                                        value={settings.autoPlug.waitMinutes}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            autoPlug: { ...settings.autoPlug, waitMinutes: parseInt(e.target.value) || 30 }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">CTA Content</label>
                                <textarea
                                    value={settings.autoPlug.ctaContent}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        autoPlug: { ...settings.autoPlug, ctaContent: e.target.value }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white resize-none"
                                    rows={2}
                                    placeholder="🔔 Follow me for more content like this!"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Auto Delete Section */}
                <div className="glass-card p-5 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-6 h-6 text-red-400" />
                            <div>
                                <h3 className="font-bold text-white">Auto Delete</h3>
                                <p className="text-sm text-gray-400">Remove low-performing posts automatically</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSettings({
                                ...settings,
                                autoDelete: { ...settings.autoDelete, enabled: !settings.autoDelete.enabled }
                            })}
                            className={`w-14 h-7 rounded-full transition-all duration-300 relative ${settings.autoDelete.enabled ? 'bg-red-500' : 'bg-gray-600'
                                }`}
                        >
                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${settings.autoDelete.enabled ? 'left-8' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    {settings.autoDelete.enabled && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-white/10">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Check After (hours)</label>
                                    <input
                                        type="number"
                                        value={settings.autoDelete.thresholdHours}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            autoDelete: { ...settings.autoDelete, thresholdHours: parseInt(e.target.value) || 24 }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Min Engagement</label>
                                    <input
                                        type="number"
                                        value={settings.autoDelete.minEngagement}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            autoDelete: { ...settings.autoDelete, minEngagement: parseInt(e.target.value) || 10 }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoDelete.excludeDrafts}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        autoDelete: { ...settings.autoDelete, excludeDrafts: e.target.checked }
                                    })}
                                    className="w-4 h-4 rounded bg-white/10 border-white/20"
                                />
                                <span className="text-sm text-gray-300">Exclude drafts from auto-delete</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : <><Save className="w-5 h-5 inline mr-2" />Save Settings</>}
                    </button>
                    <button
                        onClick={resetSettings}
                        disabled={saving}
                        className="py-3 px-6 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-all border border-white/10 disabled:opacity-50"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
