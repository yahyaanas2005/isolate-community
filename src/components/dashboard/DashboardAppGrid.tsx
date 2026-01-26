'use client';

import { getNavItems } from '@/lib/navConfig';
import Link from 'next/link';

interface DashboardAppGridProps {
    slug: string;
}

export default function DashboardAppGrid({ slug }: DashboardAppGridProps) {
    const navItems = getNavItems(slug);
    // Filter out Overview from the grid as we are ALREADY on the overview
    const apps = navItems.filter(item => item.name !== 'Overview');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Applications</h2>
                {/* Search is already in header, maybe add a filter here later */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {apps.map((app) => (
                    <Link
                        key={app.href}
                        href={app.href}
                        className="group flex flex-col items-center justify-center p-6 bg-white border rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer aspect-square text-center"
                    >
                        <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <app.icon className="w-8 h-8 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <span className="mt-3 text-sm font-medium text-gray-700 group-hover:text-blue-700">
                            {app.name}
                        </span>
                    </Link>
                ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900">Need more features?</h3>
                        <p className="text-indigo-700 mt-1">Explore our marketplace to add more capability to your community OS.</p>
                    </div>
                    <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-200">
                        Browse Marketplace
                    </button>
                </div>
            </div>
        </div>
    );
}
