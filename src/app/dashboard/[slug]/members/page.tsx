import { Suspense } from 'react';
import { getMembers } from '@/actions/members';
import MembersList from '@/components/members/MembersList';
import { Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { Tenant } from '@/lib/types';
import Link from 'next/link';

interface MembersPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{
        search?: string;
        role?: string;
        status?: string;
        page?: string;
    }>;
}

export default async function MembersPage({ params, searchParams }: MembersPageProps) {
    const { slug } = await params;
    const { search, role, status, page } = await searchParams;
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

    // 2. Fetch members
    const currentPage = Number(page) || 1;
    const { data: members, count, error } = await getMembers(
        tenant.id,
        search,
        role,
        status,
        currentPage
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-7 h-7 text-blue-600" />
                        Members Directory
                    </h1>
                    <p className="text-sm text-gray-500">Manage community members, roles, and statuses.</p>
                </div>
                <Link
                    href={`/dashboard/${slug}/members/approvals`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                    View Approval Queue &rarr;
                </Link>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    Error loading members: {error.message}
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
