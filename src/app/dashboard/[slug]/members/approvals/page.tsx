import { getMembers } from '@/actions/members';
import MembersList from '@/components/members/MembersList';
import { UserCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { Tenant } from '@/lib/types';

interface ApprovalPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function ApprovalQueuePage({ params, searchParams }: ApprovalPageProps) {
    const { slug } = await params;
    const { page } = await searchParams;
    const supabase = await createClient();

    // 1. Resolve slug to tenant_id
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, type, slug')
        .eq('slug', slug)
        .single();

    if (!tenant) {
        return <div className="p-6 text-red-600">Community not found</div>;
    }

    // 2. Fetch PENDING members
    const currentPage = Number(page) || 1;
    const { data: members, count, error } = await getMembers(
        tenant.id,
        undefined, // search
        undefined, // role
        'pending', // STATUS = PENDING
        currentPage
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <UserCheck className="w-7 h-7 text-orange-600" />
                    Membership Approval Queue
                </h1>
                <p className="text-sm text-gray-500">Review and approve pending membership requests.</p>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    Error loading requests: {error.message}
                </div>
            ) : (
                <MembersList
                    members={members || []}
                    tenant={tenant as Tenant}
                    page={currentPage}
                    count={count || 0}
                />
            )}
        </div>
    );
}
