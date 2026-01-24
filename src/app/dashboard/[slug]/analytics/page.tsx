'use client';

import { BarChart, Users, TrendingUp, Activity } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Community Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Members', value: '1,234', icon: Users, change: '+12%', color: 'blue' },
                    { label: 'Active Daily', value: '890', icon: Activity, change: '+5%', color: 'green' },
                    { label: 'New Posts', value: '45', icon: TrendingUp, change: '-2%', color: 'purple' },
                    { label: 'Engagement', value: '8.5%', icon: BarChart, change: '+1.2%', color: 'orange' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className={`p-2 w-fit rounded-lg bg-${stat.color}-100 text-${stat.color}-600 mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 h-96 flex items-center justify-center text-gray-400">
                Chart Placeholder (Recharts/Chart.js integration)
            </div>
        </div>
    );
}
