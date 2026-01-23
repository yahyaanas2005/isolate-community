'use client';

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
    const [slug, setSlug] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Should redirect to login ideally
                return;
            }

            // 2. Insert into Tenants
            const { data: tenant, error: tError } = await supabase
                .from('tenants')
                .insert({
                    name,
                    slug,
                    type
                })
                .select()
                .single();

            if (tError) {
                alert('Error creating community: ' + tError.message);
                console.error(tError);
                setLoading(false);
                return;
            }

            // 3. Insert into Memberships (as Owner)
            // Note: Our RLS implementation for Tenants might block this if not carefully set.
            // Assumption: Authenticated users can insert to 'tenants'.
            // Assumption: Profiles already exists for user (via trigger or signup).

            const { error: mError } = await supabase
                .from('memberships')
                .insert({
                    user_id: user.id,
                    tenant_id: tenant.id,
                    role: 'Owner',
                    dynamic_data: { note: 'Creator' }
                });

            if (mError) {
                console.error('Error adding owner membership:', mError);
                // But we proceed because tenant is made
            }

            // 4. Redirect
            router.push(`/dashboard/members`); // Ideally navigate to new tenant slug
            router.refresh();

        } catch (err) {
            console.error(err);
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
                        <div className="grid gap-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Community Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. Sunset Apartments"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">URL Slug</label>
                                <div className="flex items-center">
                                    <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-xl px-4 py-3 text-white/40 select-none">
                                        isolate.com/
                                    </span>
                                    <input
                                        required
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-r-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        placeholder="sunset-apartments"
                                    />
                                </div>
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
