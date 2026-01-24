'use client';

import { DollarSign, PieChart, TrendingUp, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function FinanceOverviewPage({ params }: { params: { slug: string } }) {
    const stats = [
        { title: 'Total Revenue', value: '$124,500', trend: '+12%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Expenses (YTD)', value: '$45,200', trend: '+5%', icon: CreditCard, color: 'text-red-600', bg: 'bg-red-100' },
        { title: 'Net Assets', value: '$850,000', trend: '+2%', icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Outstanding Dues', value: '$12,400', trend: '-8%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>
                <p className="text-muted-foreground">Financial health at a glance.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.title} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded bg-gray-100 ${stat.trend.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href={`/dashboard/${params.slug}/finance/ledger`} className="block w-full text-center py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black">
                            View General Ledger
                        </Link>
                        <Link href={`/dashboard/${params.slug}/finance/purchases`} className="block w-full text-center py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50">
                            Manage Purchase Orders
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
