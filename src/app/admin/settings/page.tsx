'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mail, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState({
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_password: '',
        smtp_from_email: '',
        smtp_from_name: 'Isolate Community Platform',
        smtp_enabled: false,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        const { data } = await supabase
            .from('system_settings')
            .select('*')
            .single();

        if (data) {
            setSettings({
                smtp_host: data.smtp_host || '',
                smtp_port: data.smtp_port || 587,
                smtp_user: data.smtp_user || '',
                smtp_password: data.smtp_password || '',
                smtp_from_email: data.smtp_from_email || '',
                smtp_from_name: data.smtp_from_name || 'Isolate Community Platform',
                smtp_enabled: data.smtp_enabled || false,
            });
        }
        setLoading(false);
    }

    async function saveSettings() {
        setSaving(true);
        setSaved(false);

        const { error } = await supabase
            .from('system_settings')
            .upsert(settings);

        if (!error) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }

        setSaving(false);
    }

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">System Settings</h2>
                <p className="text-gray-400">Configure platform-wide settings and integrations</p>
            </div>

            {/* SMTP Configuration */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Mail className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Email (SMTP) Configuration</h3>
                        <p className="text-sm text-gray-400">Configure outgoing email server</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Enable SMTP */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="smtp_enabled"
                            checked={settings.smtp_enabled}
                            onChange={(e) => setSettings({ ...settings, smtp_enabled: e.target.checked })}
                            className="w-5 h-5 bg-gray-800 border-gray-700 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="smtp_enabled" className="text-white font-medium">
                            Enable SMTP Email Sending
                        </label>
                    </div>

                    {/* SMTP Host */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            SMTP Host
                        </label>
                        <input
                            type="text"
                            value={settings.smtp_host}
                            onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                            placeholder="smtp.gmail.com"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* SMTP Port */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            SMTP Port
                        </label>
                        <input
                            type="number"
                            value={settings.smtp_port}
                            onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) })}
                            placeholder="587"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* SMTP User */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            SMTP Username
                        </label>
                        <input
                            type="text"
                            value={settings.smtp_user}
                            onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                            placeholder="your-email@gmail.com"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* SMTP Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            SMTP Password
                        </label>
                        <input
                            type="password"
                            value={settings.smtp_password}
                            onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            For Gmail, use an App Password (not your regular password)
                        </p>
                    </div>

                    {/* From Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            From Email Address
                        </label>
                        <input
                            type="email"
                            value={settings.smtp_from_email}
                            onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                            placeholder="noreply@isolate.com"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* From Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            From Name
                        </label>
                        <input
                            type="text"
                            value={settings.smtp_from_name}
                            onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                            placeholder="Isolate Community Platform"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {saving ? (
                        <>Saving...</>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Settings
                        </>
                    )}
                </button>

                {saved && (
                    <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        Settings saved!
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6">
                <h4 className="font-bold text-white mb-3">📧 Email Setup Instructions</h4>
                <div className="text-sm text-gray-300 space-y-2">
                    <p><strong>Gmail:</strong> Use smtp.gmail.com:587 with an App Password</p>
                    <p><strong>Outlook:</strong> Use smtp-mail.outlook.com:587</p>
                    <p><strong>SendGrid:</strong> Use smtp.sendgrid.net:587 with API key</p>
                    <p><strong>Resend (Recommended):</strong> Best for production, $20/month for 50k emails</p>
                </div>
            </div>
        </div>
    );
}
