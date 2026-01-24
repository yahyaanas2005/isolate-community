import Link from 'next/link';
import { Navigation, Car } from 'lucide-react';

export default function GuardPortalPage({ params }: { params: { slug: string } }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Guard Portal</h1>
                    <p className="text-muted-foreground">Manage entry and exit for {params.slug}.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2 rounded-md font-bold animate-pulse">
                        SOS
                    </button>
                    <Link href={`/dashboard/${params.slug}/security/patrol`} className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 rounded-md flex items-center gap-2">
                        <Navigation className="w-4 h-4" /> Patrol
                    </Link>
                    <Link href={`/dashboard/${params.slug}/security/parking`} className="bg-white border border-gray-300 hover:bg-gray-50 h-10 px-4 py-2 rounded-md flex items-center gap-2">
                        <Car className="w-4 h-4" /> Parking
                    </Link>
                    <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                        + Log Entry
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {['Expected Visitors', 'Checked In', 'Daily Help In', 'Vehicles Inside'].map((title) => (
                    <div key={title} className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex flex-col space-y-1.5">
                            <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                        </div>
                        <div className="p-6 pt-4 px-0">
                            <div className="text-2xl font-bold">0</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-md border bg-white">
                <div className="p-4 border-b bg-muted/40">
                    <h3 className="font-medium">Recent Activity Log</h3>
                </div>
                <div className="p-8 text-center text-muted-foreground">
                    No recent gate activity recorded.
                </div>
            </div>
        </div>
    )
}
