'use client';

import { useTenant } from '@/components/TenantContext';
import Link from 'next/link';
import { Plus, Building2, Briefcase, Gamepad2, ArrowRight, LayoutGrid } from 'lucide-react';
import { JoinCommunityModal } from '@/components/JoinCommunityModal';
import { useState } from 'react';

import { LogoutButton } from '@/components/LogoutButton';

export default function DashboardPage() {
    const { availableTenants, switchTenant } = useTenant();
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    // ... (icons logic) ...

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <header className="max-w-7xl mx-auto mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">My Communities</h1>
                    <p className="text-white/50">Select a workspace to manage or collaborate.</p>
                </div>
                <LogoutButton />
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Create New Card */}
                <Link
                    href="/dashboard/create"
                    className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-white/20 hover:border-white/50 hover:bg-white/[0.03] transition-all duration-300 min-h-[240px]"
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
                    className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-white/[0.03] transition-all duration-300 min-h-[240px]"
                >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <LayoutGrid className="w-8 h-8 text-white/70 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <span className="font-semibold text-lg">Join Existing</span>
                    <span className="text-sm text-white/40 mt-1">Enter an Invite ID</span>
                </button>

                {/* Existing Communities */}
                {availableTenants.map((community) => (
                    <Link
                        key={community.id}
                        href={`/dashboard/${community.slug || 'members'}`} // For now default to members if slug logic not fully done
                        onClick={() => switchTenant(community.slug)}
                        className={`group relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br transition-all duration-300 ${getGradient(community.type)} overflow-hidden`}
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

            </main>

            <JoinCommunityModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
        </div>
    );
}
