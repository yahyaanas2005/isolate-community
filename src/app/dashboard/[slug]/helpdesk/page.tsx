import { Suspense } from 'react';
import { getTickets, getTicketCategories } from '@/actions/helpdesk';
import TicketCard from '@/components/helpdesk/TicketCard';
import CreateTicketDialog from '@/components/helpdesk/CreateTicketDialog';
import { Loader2, Search } from 'lucide-react';
import { TicketStatus } from '@/lib/types/helpdesk';

interface HelpDeskPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ status?: string }>;
}

export default async function HelpDeskPage({ params, searchParams }: HelpDeskPageProps) {
    const { slug } = await params;
    const { status } = await searchParams;

    // NOTE: Ideally we resolve slug -> community_id. 
    // For this MVP assumption: slug IS the community_id or we are using it directly.
    // If slug is a vanity URL, we need a lookup. 
    // Checking previous context, it seems used as ID in some places or simple string.
    // We will pass slug as communityId for now.
    const communityId = slug;

    const { data: tickets, error } = await getTickets(communityId, status as TicketStatus);
    const { data: categories } = await getTicketCategories(communityId);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Help Desk</h1>
                    <p className="text-sm text-gray-500">Raise complaints and track their status</p>
                </div>
                <CreateTicketDialog communityId={communityId} />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <FilterButton label="All Tickets" active={!status} href={`/dashboard/${slug}/helpdesk`} />
                <FilterButton label="Open" active={status === 'OPEN'} href={`/dashboard/${slug}/helpdesk?status=OPEN`} />
                <FilterButton label="In Progress" active={status === 'IN_PROGRESS'} href={`/dashboard/${slug}/helpdesk?status=IN_PROGRESS`} />
                <FilterButton label="Resolved" active={status === 'RESOLVED'} href={`/dashboard/${slug}/helpdesk?status=RESOLVED`} />
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                    Failed to load tickets. Please try again.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tickets?.map(ticket => (
                    <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        basePath={`/dashboard/${slug}/helpdesk`}
                    />
                ))}
            </div>

            {tickets?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No tickets found.</p>
                </div>
            )}
        </div>
    );
}

function FilterButton({ label, active, href }: { label: string, active: boolean, href: string }) {
    return (
        <a
            href={href}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${active
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
        >
            {label}
        </a>
    );
}
