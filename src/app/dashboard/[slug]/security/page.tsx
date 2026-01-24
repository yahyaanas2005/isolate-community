import { getVisitors } from '@/actions/security';
import VisitorCard from '@/components/security/VisitorCard';
import PreApproveDialog from '@/components/security/PreApproveDialog';
import { Shield, Users, Clock } from 'lucide-react';
import { VisitorStatus } from '@/lib/types/security';

interface SecurityPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ status?: string }>;
}

export default async function SecurityPage({ params, searchParams }: SecurityPageProps) {
    const { slug } = await params;
    const { status } = await searchParams;
    const communityId = slug;

    const { data: visitors, error } = await getVisitors(communityId, status as VisitorStatus);

    const stats = {
        total: visitors?.length || 0,
        checkedIn: visitors?.filter(v => v.status === 'CHECKED_IN').length || 0,
        pending: visitors?.filter(v => v.status === 'PENDING').length || 0
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-7 h-7 text-blue-600" />
                        Security Gate
                    </h1>
                    <p className="text-sm text-gray-500">Manage visitor access and gate passes</p>
                </div>
                <PreApproveDialog communityId={communityId} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Visitors</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Currently Inside</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.checkedIn}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Shield className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Approval</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <FilterButton label="All" active={!status} href={`/dashboard/${slug}/security`} />
                <FilterButton label="Pending" active={status === 'PENDING'} href={`/dashboard/${slug}/security?status=PENDING`} />
                <FilterButton label="Checked In" active={status === 'CHECKED_IN'} href={`/dashboard/${slug}/security?status=CHECKED_IN`} />
                <FilterButton label="Checked Out" active={status === 'CHECKED_OUT'} href={`/dashboard/${slug}/security?status=CHECKED_OUT`} />
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                    Failed to load visitors. Please try again.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visitors?.map(visitor => (
                    <VisitorCard key={visitor.id} visitor={visitor} />
                ))}
            </div>

            {visitors?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No visitors found.</p>
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
