'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mail, Plus, X, Check, Globe, Trash2, Star } from 'lucide-react';

export default function SMTPAccountsPage() {
    const supabase = createClient();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newAccount, setNewAccount] = useState({
        name: '',
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_password: '',
        smtp_from_email: '',
        smtp_from_name: 'Isolate Support',
        region: '',
        purpose: '',
        is_default: false
    });

    useEffect(() => {
        loadAccounts();
    }, []);

    async function loadAccounts() {
        setLoading(true);
        const { data } = await supabase
            .from('platform_smtp_accounts')
            .select('*')
            .order('is_default', { ascending: false });

        setAccounts(data || []);
        setLoading(false);
    }

    async function addAccount() {
        setSaving(true);

        // If this is default, unset other defaults
        if (newAccount.is_default) {
            await supabase
                .from('platform_smtp_accounts')
                .update({ is_default: false })
                .eq('is_default', true);
        }

        await supabase.from('platform_smtp_accounts').insert({
            ...newAccount,
            region: newAccount.region || null,
            purpose: newAccount.purpose || null
        });

        setNewAccount({
            name: '',
            smtp_host: '',
            smtp_port: 587,
            smtp_user: '',
            smtp_password: '',
            smtp_from_email: '',
            smtp_from_name: 'Isolate Support',
            region: '',
            purpose: '',
            is_default: false
        });
        setShowAddModal(false);
        setSaving(false);
        loadAccounts();
    }

    async function deleteAccount(id: string) {
        if (!confirm('Delete this SMTP account?')) return;
        await supabase.from('platform_smtp_accounts').delete().eq('id', id);
        loadAccounts();
    }

    async function setAsDefault(id: string) {
        await supabase.from('platform_smtp_accounts').update({ is_default: false }).eq('is_default', true);
        await supabase.from('platform_smtp_accounts').update({ is_default: true }).eq('id', id);
        loadAccounts();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Platform Email Accounts</h2>
                    <p className="text-gray-400">Manage SMTP accounts for system emails (region/purpose-based)</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add SMTP Account
                </button>
            </div>

            {/* Accounts List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : accounts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No SMTP accounts configured</div>
                ) : (
                    accounts.map((account) => (
                        <div key={account.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">{account.name}</span>
                                            {account.is_default && (
                                                <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
                                                    <Star className="w-3 h-3" /> Default
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            {account.smtp_from_name} &lt;{account.smtp_from_email}&gt;
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            {account.smtp_host}:{account.smtp_port}
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            {account.region && (
                                                <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded flex items-center gap-1">
                                                    <Globe className="w-3 h-3" /> {account.region.toUpperCase()}
                                                </span>
                                            )}
                                            {account.purpose && (
                                                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                                                    {account.purpose}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!account.is_default && (
                                        <button
                                            onClick={() => setAsDefault(account.id)}
                                            className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                                        >
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteAccount(account.id)}
                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Add SMTP Account</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Account Name</label>
                                <input
                                    type="text"
                                    value={newAccount.name}
                                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                                    placeholder="North America SMTP"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
                                    <input
                                        type="text"
                                        value={newAccount.smtp_host}
                                        onChange={(e) => setNewAccount({ ...newAccount, smtp_host: e.target.value })}
                                        placeholder="smtp.gmail.com"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
                                    <input
                                        type="number"
                                        value={newAccount.smtp_port}
                                        onChange={(e) => setNewAccount({ ...newAccount, smtp_port: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Username</label>
                                <input
                                    type="text"
                                    value={newAccount.smtp_user}
                                    onChange={(e) => setNewAccount({ ...newAccount, smtp_user: e.target.value })}
                                    placeholder="your-email@gmail.com"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Password</label>
                                <input
                                    type="password"
                                    value={newAccount.smtp_password}
                                    onChange={(e) => setNewAccount({ ...newAccount, smtp_password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">From Email</label>
                                    <input
                                        type="email"
                                        value={newAccount.smtp_from_email}
                                        onChange={(e) => setNewAccount({ ...newAccount, smtp_from_email: e.target.value })}
                                        placeholder="support@isolate.com"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">From Name</label>
                                    <input
                                        type="text"
                                        value={newAccount.smtp_from_name}
                                        onChange={(e) => setNewAccount({ ...newAccount, smtp_from_name: e.target.value })}
                                        placeholder="Isolate Support"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Region (optional)</label>
                                    <select
                                        value={newAccount.region}
                                        onChange={(e) => setNewAccount({ ...newAccount, region: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">All Regions</option>
                                        <option value="us">North America</option>
                                        <option value="eu">Europe</option>
                                        <option value="asia">Asia Pacific</option>
                                        <option value="mena">Middle East</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Purpose (optional)</label>
                                    <select
                                        value={newAccount.purpose}
                                        onChange={(e) => setNewAccount({ ...newAccount, purpose: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">All Purposes</option>
                                        <option value="welcome">Welcome Emails</option>
                                        <option value="support">Support Emails</option>
                                        <option value="transactional">Transactional</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={newAccount.is_default}
                                    onChange={(e) => setNewAccount({ ...newAccount, is_default: e.target.checked })}
                                    className="w-5 h-5 bg-gray-800 border-gray-700 rounded text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="is_default" className="text-white">Set as default SMTP account</label>
                            </div>

                            <button
                                onClick={addAccount}
                                disabled={saving || !newAccount.name || !newAccount.smtp_host || !newAccount.smtp_user}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? 'Saving...' : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Add SMTP Account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
