'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';
import { Mail, Save, CheckCircle, TestTube, AlertCircle } from 'lucide-react';

export default function EmailSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const supabase = createClient();

    const [tenantId, setTenantId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const [settings, setSettings] = useState({
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_password: '',
        smtp_from_email: '',
        smtp_from_name: '',
        smtp_enabled: false,
    });

    useEffect(() => {
        async function init() {
            const { data: tenant } = await supabase
                .from('tenants')
                .select('id, name, smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name, smtp_enabled')
                .eq('slug', slug)
                .single();

            if (tenant) {
                setTenantId(tenant.id);
                setSettings({
                    smtp_host: tenant.smtp_host || '',
                    smtp_port: tenant.smtp_port || 587,
                    smtp_user: tenant.smtp_user || '',
                    smtp_password: tenant.smtp_password || '',
                    smtp_from_email: tenant.smtp_from_email || '',
                    smtp_from_name: tenant.smtp_from_name || tenant.name || '',
                    smtp_enabled: tenant.smtp_enabled || false,
                });
            }
            setLoading(false);
        }
        init();
    }, [slug]);

    async function saveSettings() {
        if (!tenantId) return;
        setSaving(true);
        setSaved(false);

        await supabase
            .from('tenants')
            .update(settings)
            .eq('id', tenantId);

        setSaved(true);
        setSaving(false);
        setTimeout(() => setSaved(false), 3000);
    }

    async function testEmail() {
        setTesting(true);
        setTestResult(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
            setTestResult({ success: false, message: 'No email found for current user' });
            setTesting(false);
            return;
        }

        // For now, just simulate success since SMTP is mock
        setTimeout(() => {
            setTestResult({
                success: true,
                message: `Test email would be sent to ${user.email}`
            });
            setTesting(false);
        }, 1500);
    }

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Email Settings</h1>
                <p className="text-gray-400">Configure SMTP for community emails (invitations, notices, etc.)</p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                    <strong>Optional:</strong> If not configured, emails will be sent from the platform's default SMTP.
                    Configure your own SMTP to send emails from your community's domain.
                </div>
            </div>

            {/* SMTP Configuration */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Mail className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">SMTP Configuration</h3>
                        <p className="text-sm text-gray-400">Outgoing email server settings</p>
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
                            Use custom SMTP for this community
                        </label>
                    </div>

                    <div className={settings.smtp_enabled ? '' : 'opacity-50 pointer-events-none'}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Port
                                </label>
                                <input
                                    type="number"
                                    value={settings.smtp_port}
                                    onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
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

                        <div className="mt-4">
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
                                For Gmail, use an App Password
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    From Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.smtp_from_email}
                                    onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                                    placeholder="notices@yourcommunity.com"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    From Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.smtp_from_name}
                                    onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                                    placeholder="Your Community Name"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {saving ? 'Saving...' : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Settings
                        </>
                    )}
                </button>

                <button
                    onClick={testEmail}
                    disabled={testing || !settings.smtp_enabled}
                    className="px-6 py-3 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {testing ? 'Testing...' : (
                        <>
                            <TestTube className="w-5 h-5" />
                            Send Test Email
                        </>
                    )}
                </button>

                {saved && (
                    <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        Saved!
                    </div>
                )}
            </div>

            {testResult && (
                <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
                    <p className={testResult.success ? 'text-green-400' : 'text-red-400'}>
                        {testResult.message}
                    </p>
                </div>
            )}
        </div>
    );
}
