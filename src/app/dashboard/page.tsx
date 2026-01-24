'use client';

import { useTenant } from '@/components/TenantContext';
import Link from 'next/link';
import { Plus, Building2, Briefcase, Gamepad2, ArrowRight, LayoutGrid, LogOut } from 'lucide-react';
import { JoinCommunityModal } from '@/components/JoinCommunityModal';
import { useState } from 'react';
import { signOut } from '@/app/login/actions';

export default function DashboardPage() {
    const { availableTenants, switchTenant } = useTenant();
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);


    const getIcon = (type: string) => {
        switch (type) {
            case 'Physical': return <Building2 className="w-6 h-6 text-purple-400" />;
            case 'Professional': return <Briefcase className="w-6 h-6 text-blue-400" />;
            case 'Virtual': return <Gamepad2 className="w-6 h-6 text-teal-400" />;
            default: return <LayoutGrid className="w-6 h-6 text-gray-400" />;
        }
    };

    const getGradient = (type: string) => {
        switch (type) {
            case 'Physical': return 'from-purple-500/20 to-purple-900/10 hover:border-purple-500/50';
            case 'Professional': return 'from-blue-500/20 to-blue-900/10 hover:border-blue-500/50';
            case 'Virtual': return 'from-teal-500/20 to-teal-900/10 hover:border-teal-500/50';
            default: return 'from-gray-800 to-gray-900';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            {/* Header with prominent logout button */}
            <header className="max-w-7xl mx-auto mb-12">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">My Communities</h1>
                        <p className="text-white/50">Select a workspace to manage or collaborate.</p>
                    </div>
                    {/* PROMINENT LOGOUT BUTTON */}
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-medium transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </form>
                </div>

                {/* Stats bar */}
                <div className="flex items-center gap-6 bg-white/5 rounded-2xl px-6 py-4 border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-white/60">
                            {availableTenants.length} {availableTenants.length === 1 ? 'Community' : 'Communities'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-12">
                {/* Action Cards */}
                <section>
                    <h2 className="text-xl font-semibold mb-6 text-white/80">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        {/* Create New Card */}
                        <Link
                            href="/dashboard/create"
                            className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-white/20 hover:border-white/50 hover:bg-white/[0.03] transition-all duration-300 min-h-[200px]"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-white/70" />
                            </div>
                            <span className="font-semibold text-lg">Create New Community</span>
                            <span className="text-sm text-white/40 mt-1">Setup a space for your team</span>
                        </Link>

                        {/* Join Existing Card */}
                        <button
                            onClick={() => setIsJoinModalOpen(true)}
                            className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-white/[0.03] transition-all duration-300 min-h-[200px]"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <LayoutGrid className="w-8 h-8 text-white/70 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <span className="font-semibold text-lg">Join Existing</span>
                            <span className="text-sm text-white/40 mt-1">Enter an Invite ID</span>
                        </button>
                    </div>
                </section>

                {/* My Communities List */}
                {availableTenants.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-6 text-white/80">My Communities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableTenants.map((community) => (
                                <Link
                                    key={community.id}
                                    href={`/dashboard/${community.slug || 'members'}`}
                                    onClick={() => switchTenant(community.slug)}
                                    className={`group relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br transition-all duration-300 ${getGradient(community.type)} overflow-hidden hover:scale-[1.02]`}
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight className="w-5 h-5 text-white/50" />
                                    </div>

                                    <div className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-sm flex items-center justify-center mb-6">
                                        {getIcon(community.type)}
                                    </div>

                                    <h3 className="text-2xl font-bold mb-2 truncate">{community.name}</h3>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/20 text-white/70 border border-white/5">
                                        {community.type}
                                    </div>
                                    <div className="mt-4 text-xs text-white/30 font-mono hidden group-hover:block animate-in fade-in">
                                        ID: {community.id.slice(0, 8)}...
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {availableTenants.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <Building2 className="w-12 h-12 text-white/30" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white/60">No communities yet</h3>
                        <p className="text-white/40 mb-8">Create your first community or join an existing one to get started.</p>
                    </div>
                )}
            </main>

            <JoinCommunityModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
        </div>
    );
}
