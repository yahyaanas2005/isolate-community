import { Shield, UserPlus, ScanLine } from 'lucide-react';
import Link from 'next/link';

interface SecurityPageProps {
    params: Promise<{ slug: string }>;
}

export default async function SecurityPage({ params }: SecurityPageProps) {
    const { slug } = await params;

    const cards = [
        {
            title: "My Visitors",
            description: "Manage guest passes and invitations",
            icon: UserPlus,
            href: `/dashboard/${slug}/security/visitors`,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Guard Station",
            description: "Scanner console for security personnel",
            icon: ScanLine,
            href: `/dashboard/${slug}/security/gate`,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        // Add Patrol Logs later
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-8 h-8 text-indigo-600" />
                    Security Center
                </h1>
                <p className="text-gray-500 mt-1">Manage community access and safety.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <Link key={card.title} href={card.href} className="group block">
                        <div className="bg-white rounded-xl border p-6 transition-all hover:shadow-lg hover:border-indigo-200">
                            <div className={`h-12 w-12 rounded-lg ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">{card.title}</h3>
                            <p className="text-sm text-gray-500">{card.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
