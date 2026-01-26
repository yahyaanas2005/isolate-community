'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List } from 'lucide-react';
import DashboardAppGrid from './DashboardAppGrid';

interface OverviewContentProps {
    slug: string;
}

export default function OverviewContent({ slug }: OverviewContentProps) {
    const [viewMode, setViewMode] = useState<'classic' | 'cloudhq'>('classic');

    const toggleView = () => {
        setViewMode(current => current === 'classic' ? 'cloudhq' : 'classic');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <div className="flex items-center gap-4">
                    <span className="hidden md:inline text-sm text-muted-foreground">Community: {slug}</span>
                    <button
                        onClick={toggleView}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm transition-all"
                    >
                        {viewMode === 'classic' ? (
                            <>
                                <LayoutGrid className="w-4 h-4" />
                                <span>Core View</span>
                            </>
                        ) : (
                            <>
                                <List className="w-4 h-4" />
                                <span>Classic View</span>
                            </>
                        )}
                    </button>
                    <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition-all">
                        + Add Features
                    </button>
                </div>
            </div>

            {viewMode === 'cloudhq' ? (
                <DashboardAppGrid slug={slug} />
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Link href={`/dashboard/${slug}/members`} className="block transition-transform hover:scale-105 cursor-pointer">
                            <div className="h-full rounded-xl border bg-card text-card-foreground shadow p-6 hover:border-blue-300">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="tracking-tight text-sm font-medium">Total Members</h3>
                                    <div className="text-2xl">👤</div>
                                </div>
                                <div className="text-2xl font-bold">128</div>
                                <p className="text-xs text-muted-foreground pt-1">
                                    <span className="text-green-500 font-medium">+12%</span> from last month
                                </p>
                            </div>
                        </Link>

                        <Link href={`/dashboard/${slug}/helpdesk`} className="block transition-transform hover:scale-105 cursor-pointer">
                            <div className="h-full rounded-xl border bg-card text-card-foreground shadow p-6 hover:border-yellow-300">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="tracking-tight text-sm font-medium">Active Issues</h3>
                                    <div className="text-2xl">⚠️</div>
                                </div>
                                <div className="text-2xl font-bold">5</div>
                                <p className="text-xs text-muted-foreground pt-1">
                                    <span className="text-red-500 font-medium">-2%</span> from last month
                                </p>
                            </div>
                        </Link>

                        <Link href={`/dashboard/${slug}/events`} className="block transition-transform hover:scale-105 cursor-pointer">
                            <div className="h-full rounded-xl border bg-card text-card-foreground shadow p-6 hover:border-purple-300">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="tracking-tight text-sm font-medium">Upcoming Events</h3>
                                    <div className="text-2xl">📅</div>
                                </div>
                                <div className="text-2xl font-bold">3</div>
                                <p className="text-xs text-muted-foreground pt-1">
                                    Next: Saturday
                                </p>
                            </div>
                        </Link>

                        <Link href={`/dashboard/${slug}/finance`} className="block transition-transform hover:scale-105 cursor-pointer">
                            <div className="h-full rounded-xl border bg-card text-card-foreground shadow p-6 hover:border-green-300">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="tracking-tight text-sm font-medium">Pending Revenue</h3>
                                    <div className="text-2xl">💰</div>
                                </div>
                                <div className="text-2xl font-bold">$2,450</div>
                                <p className="text-xs text-muted-foreground pt-1">
                                    <span className="text-green-500 font-medium">+5%</span> from last month
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="font-semibold">Recent Activity</h3>
                                <Link href={`/dashboard/${slug}/analytics`} className="text-xs text-blue-600 hover:underline">View All</Link>
                            </div>
                            <div className="p-6">
                                <div className="space-y-8">
                                    {[
                                        { user: 'Sarah M.', action: 'submitted a maintenance request', time: '2 hours ago', link: `/dashboard/${slug}/requests` },
                                        { user: 'John D.', action: 'paid invoice #INV-2024-001', time: '4 hours ago', link: `/dashboard/${slug}/finance` },
                                        { user: 'Security Gate', action: 'checked in Visitor: Mike Ross', time: '5 hours ago', link: `/dashboard/${slug}/security` },
                                        { user: 'Admin', action: 'published new poll: "Gym Timing"', time: 'Yesterday', link: `/dashboard/${slug}/polls` },
                                    ].map((activity, i) => (
                                        <Link key={i} href={activity.link} className="flex items-center hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors cursor-pointer">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {activity.user} <span className="font-normal text-muted-foreground">{activity.action}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 border-b">
                                <h3 className="font-semibold">Quick Actions</h3>
                            </div>
                            <div className="p-6 grid gap-4">
                                <Link href={`/dashboard/${slug}/notices/new`} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                                    📢 Post Announcement
                                </Link>
                                <Link href={`/dashboard/${slug}/security/new-visitor`} className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                                    🛡️ Register Visitor
                                </Link>
                                <Link href={`/dashboard/${slug}/events/new`} className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                                    📅 Create Event
                                </Link>
                                <button className="w-full text-xs text-gray-500 hover:text-gray-900 underline mt-2">
                                    + Add Custom Action
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
