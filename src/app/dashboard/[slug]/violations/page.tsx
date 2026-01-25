import { getViolations } from '@/actions/violations';
import ViolationCard from '@/components/violations/ViolationCard';
import ReportViolationDialog from '@/components/violations/ReportViolationDialog';
import { AlertTriangle } from 'lucide-react';

interface ViolationsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ViolationsPage({ params }: ViolationsPageProps) {
    const { slug } = await params;
    const { data: violations, error } = await getViolations(slug);

    const stats = {
        total: violations?.length || 0,
        confirmed: violations?.filter(v => v.status === 'CONFIRMED').length || 0,
        pending: violations?.filter(v => v.status === 'REPORTED' || v.status === 'UNDER_REVIEW').length || 0,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-7 h-7 text-orange-600" />
                        Violations & Fines
                    </h1>
                    <p className="text-sm text-gray-500">Report and track community violations</p>
                </div>
                <ReportViolationDialog communityId={slug} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Violations</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Review</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Confirmed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                    Failed to load violations. Please try again.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {violations?.map(violation => (
                    <ViolationCard key={violation.id} violation={violation} />
                ))}
            </div>

            {violations?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No violations reported.</p>
                </div>
            )}
        </div>
    );
}
