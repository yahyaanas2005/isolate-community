'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Shield,
    Bell,
    Calendar,
    FileText,
    BarChart,
    CreditCard,
    Map,
    TrendingUp,
    Settings,
    Home
} from 'lucide-react';

interface SidebarProps {
    slug: string;
}

export function Sidebar({ slug }: SidebarProps) {
    const pathname = usePathname();
    const baseUrl = `/dashboard/${slug}`;

    const navItems = [
        { name: 'Overview', href: baseUrl, icon: Home },
        { name: 'Security & Gate', href: `${baseUrl}/security/guard`, icon: Shield },
        { name: 'Notifications', href: `${baseUrl}/notifications`, icon: Bell },
        { name: 'Events', href: `${baseUrl}/events`, icon: Calendar },
        { name: 'Forms', href: `${baseUrl}/forms`, icon: FileText },
        { name: 'Polls', href: `${baseUrl}/polls`, icon: BarChart },
        { name: 'Billing', href: `${baseUrl}/billing/dashboard`, icon: CreditCard },
        { name: 'Analytics', href: `${baseUrl}/analytics`, icon: TrendingUp },
        { name: 'Roadmap', href: `${baseUrl}/roadmap`, icon: Map },
        { name: 'Settings', href: `${baseUrl}/integrations`, icon: Settings },
    ];

    return (
        <div className="w-64 bg-white border-r h-full flex flex-col">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Isolate
                </h2>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Community OS</p>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t bg-gray-50">
                <div className="text-xs text-center text-gray-500">
                    v1.2 Major Release
                </div>
            </div>
        </div>
    );
}
