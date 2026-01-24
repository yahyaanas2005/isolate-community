'use client';

import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Search, Plus, Bell } from 'lucide-react';
import Link from 'next/link';

export default function JobsPage({ params }: { params: { slug: string } }) {
    const jobs = [
        { id: '1', title: 'Community Manager', company: 'Sunnyvale HOA', location: 'On-site', type: 'Part-time', salary: '$25/hr', posted: '2d ago' },
        { id: '2', title: 'Gardener', company: 'Green Thumb Co', location: 'On-site', type: 'Contract', salary: '$20/hr', posted: '5h ago' },
        { id: '3', title: 'Frontend Developer', company: 'TechRemote', location: 'Remote', type: 'Full-time', salary: '$80k-100k', posted: '1w ago' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Board</h1>
                    <p className="text-muted-foreground">Find local opportunities and remote work.</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/${params.slug}/jobs/alerts`} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                        <Bell className="w-4 h-4" />
                        Alerts
                    </Link>
                    <Link href={`/dashboard/${params.slug}/jobs/new`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        Post Job
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        placeholder="Search job titles or keywords..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select className="px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white">
                    <option>All Types</option>
                    <option>Full-time</option>
                    <option>Contract</option>
                </select>
                <button className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800">
                    Search
                </button>
            </div>

            {/* Grid */}
            <div className="grid gap-4">
                {jobs.map((job) => (
                    <Link key={job.id} href={`/dashboard/${params.slug}/jobs/${job.id}`} className="block">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-400 transition-colors flex justify-between items-start group">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600">{job.title}</h3>
                                    <p className="text-sm text-gray-600 font-medium">{job.company}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {job.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" /> {job.type}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" /> {job.salary}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold mb-2">New</span>
                                <p className="text-xs text-gray-400">{job.posted}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
