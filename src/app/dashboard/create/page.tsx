'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Building2, Briefcase, Gamepad2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateCommunityPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [type, setType] = useState<'Physical' | 'Professional' | 'Virtual'>('Physical');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/communities/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    type,
                    description,
                    is_public: isPublic
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to create community');
                setLoading(false);
                return;
            }

            // Success! Redirect to the new community
            const community = data.community;
            router.push(`/dashboard/${community.slug}`);
            router.refresh();

        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col p-8">
            <header className="max-w-4xl mx-auto w-full mb-12">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Cancel & Return
                </Link>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Create New Community</h1>
                    <div className="flex items-center gap-2 text-sm text-white/40 font-mono">
                        Step <span className="text-purple-400 font-bold">{step}</span> of 2
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto w-full flex-1">
                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* Step 1: Type Selection */}
                    <div className={`space-y-6 transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'hidden opacity-0'}`}>
                        <h2 className="text-xl font-medium text-white/80">What type of community are you building?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'Physical', icon: Building2, color: 'text-purple-400', bg: 'hover:border-purple-500/50' },
                                { id: 'Professional', icon: Briefcase, color: 'text-blue-400', bg: 'hover:border-blue-500/50' },
                                { id: 'Virtual', icon: Gamepad2, color: 'text-teal-400', bg: 'hover:border-teal-500/50' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setType(item.id as any)}
                                    className={`relative p-6 rounded-2xl border text-left transition-all duration-200 ${type === item.id ? `bg-white/10 border-white/50 ring-1 ring-white/50` : `bg-white/5 border-white/10 ${item.bg} opacity-70 hover:opacity-100`}`}
                                >
                                    <item.icon className={`w-8 h-8 mb-4 ${item.color}`} />
                                    <h3 className="text-lg font-bold mb-1">{item.id}</h3>
                                    <p className="text-sm text-white/40">Select for {item.id.toLowerCase()} spaces.</p>
                                </button>
                            ))}
                        </div>
                        <div className="pt-8">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Details */}
                    <div className={`space-y-6 transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'hidden opacity-0'}`}>
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-3 text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Community Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. Sunset Apartments"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                    placeholder="Briefly describe your community..."
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_public"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="w-5 h-5 rounded bg-white/5 border-white/20 text-purple-500 focus:ring-purple-500"
                                />
                                <label htmlFor="is_public" className="text-sm text-white/70 cursor-pointer">
                                    Make this community public (anyone can join without invite code)
                                </label>
                            </div>
                        </div>

                        <div className="pt-8 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Launch Community
                            </button>
                        </div>
                    </div>

                </form>
            </main>
        </div>
    );
}
