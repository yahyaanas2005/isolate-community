
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
    MessageCircle,
    Briefcase,
    CheckCircle,
    Clipboard,
    AlertTriangle,
    Users,
    PieChart,
    Megaphone,
    LifeBuoy
} from 'lucide-react';

export const getNavItems = (slug: string) => {
    const baseUrl = `/dashboard/${slug}`;
    return [
        { name: 'Overview', href: baseUrl, icon: Home },
        { name: 'Members', href: `${baseUrl}/members`, icon: Users },
        { name: 'Security & Gate', href: `${baseUrl}/security/guard`, icon: Shield },
        { name: 'Notices', href: `${baseUrl}/notices`, icon: Megaphone },
        { name: 'Notifications', href: `${baseUrl}/notifications`, icon: Bell },
        { name: 'Events', href: `${baseUrl}/events`, icon: Calendar },
        { name: 'Marketplace', href: `${baseUrl}/marketplace`, icon: ShoppingBag }, // Feature 1
        { name: 'Jobs', href: `${baseUrl}/jobs`, icon: Briefcase },                 // Feature 2
        { name: 'My Requests', href: `${baseUrl}/requests`, icon: FileText },       // Feature 5
        { name: 'Approvals', href: `${baseUrl}/requests/queue`, icon: CheckCircle }, // Feature 5 (Admin)
        { name: 'Violations', href: `${baseUrl}/violations`, icon: AlertTriangle }, // Feature 4
        { name: 'Messages', href: `${baseUrl}/messages`, icon: MessageCircle },     // Feature 1
        { name: 'Forms', href: `${baseUrl}/forms`, icon: Clipboard },
        { name: 'Polls', href: `${baseUrl}/polls`, icon: BarChart },
        { name: 'Billing', href: `${baseUrl}/billing/dashboard`, icon: CreditCard },
        { name: 'Analytics', href: `${baseUrl}/analytics`, icon: TrendingUp },
        { name: 'Reputation', href: `${baseUrl}/reputation`, icon: Trophy }, // Feature 24
        { name: 'Automation', href: `${baseUrl}/automation`, icon: Zap },   // Feature 23
        { name: 'Roadmap', href: `${baseUrl}/roadmap`, icon: Map },
        { name: 'Committees', href: `${baseUrl}/committees`, icon: Users }, // Feature 6
        { name: 'Finance', href: `${baseUrl}/finance`, icon: PieChart },    // Feature 8
        { name: 'Marketing', href: `${baseUrl}/marketing`, icon: Megaphone }, // Feature 9
        { name: 'Help Desk', href: `${baseUrl}/helpdesk`, icon: LifeBuoy },
        { name: 'Settings', href: `${baseUrl}/helpdesk/settings`, icon: Settings },
    ];
};
