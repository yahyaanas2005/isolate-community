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
    Home,
    Trophy,
    Zap,
    ShoppingBag,
    MessageCircle
} from 'lucide-react';

import LanguageSelector from './LanguageSelector';
import UserNav from './UserNav';

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
        { name: 'Marketplace', href: `${baseUrl}/marketplace`, icon: ShoppingBag }, // Feature 1
        { name: 'Messages', href: `${baseUrl}/messages`, icon: MessageCircle },   // Feature 1
        { name: 'Forms', href: `${baseUrl}/forms`, icon: FileText },
        { name: 'Polls', href: `${baseUrl}/polls`, icon: BarChart },
        { name: 'Billing', href: `${baseUrl}/billing/dashboard`, icon: CreditCard },
        { name: 'Analytics', href: `${baseUrl}/analytics`, icon: TrendingUp },
        { name: 'Reputation', href: `${baseUrl}/reputation`, icon: Trophy }, // Feature 24
        { name: 'Automation', href: `${baseUrl}/automation`, icon: Zap },   // Feature 23
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
            <div className="border-t border-gray-200">
                <UserNav slug={slug} />
                <div className="px-4 pb-2 flex justify-between items-center text-xs text-slate-500">
                    <LanguageSelector />
                    <span>v2.0</span>
                </div>
                <div className="px-4 pb-4 flex gap-3 text-[10px] text-slate-400">
                    <Link href="/docs" className="hover:text-blue-600 hover:underline">Help & Docs</Link>
                    <span>•</span>
                    <Link href="/developer" className="hover:text-blue-600 hover:underline">API & Devs</Link>
                </div>
            </div>
        </div>
    );
}
