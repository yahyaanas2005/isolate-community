import { getCommittees } from '@/actions/committees';
import CommitteeCard from '@/components/committees/CommitteeCard';
import { Users, Plus } from 'lucide-react';

interface CommitteesPageProps {
    params: Promise<{ slug: string }>;
}

export default async function CommitteesPage({ params }: CommitteesPageProps) {
    const { slug } = await params;
    const { data: committees, error } = await getCommittees(slug);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-7 h-7 text-blue-600" />
                        Committees & Governance
                    </h1>
                    <p className="text-sm text-gray-500">Community committees and meeting schedules</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    New Committee
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                    Failed to load committees. Please try again.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {committees?.map(committee => (
                    <CommitteeCard key={committee.id} committee={committee} basePath={`/dashboard/${slug}/committees`} />
                ))}
            </div>

            {committees?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No committees created yet.</p>
                </div>
            )}
        </div>
    );
}
