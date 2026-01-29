import { Suspense } from 'react';
import { getComplaints, getCategories } from '@/actions/complaints';
import ComplaintList from '@/components/complaints/ComplaintList';
import CreateComplaintDialog from '@/components/complaints/CreateComplaintDialog';
import { LifeBuoy } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

interface HelpDeskPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function HelpDeskPage({ params, searchParams }: HelpDeskPageProps) {
    const { slug } = await params;
    const { status, search } = await searchParams;
    const supabase = await createClient();

    // 1. Resolve slug to tenant_id
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('slug', slug)
        .single();

    if (!tenant) {
        return <div className="p-6 text-red-600">Community not found</div>;
    }

    // 2. Fetch Data
    const [complaintsData, categoriesData] = await Promise.all([
        getComplaints(tenant.id, { status, search }),
        getCategories(tenant.id)
    ]);

    const { data: complaints, error } = complaintsData;
    const { data: categories } = categoriesData;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <LifeBuoy className="w-7 h-7 text-blue-600" />
                        Help Desk
                    </h1>
                    <p className="text-sm text-gray-500">Raise and track maintenance issues and complaints.</p>
                </div>
                <CreateComplaintDialog
                    tenantId={tenant.id}
                    categories={categories || []}
                />
            </div>

            {/* Simple Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <Link
                    href={`/dashboard/${slug}/helpdesk`}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full ${!status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    All
                </Link>
                <Link
                    href={`/dashboard/${slug}/helpdesk?status=new`}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full ${status === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    New
                </Link>
                <Link
                    href={`/dashboard/${slug}/helpdesk?status=in_progress`}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full ${status === 'in_progress' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    In Progress
                </Link>
                <Link
                    href={`/dashboard/${slug}/helpdesk?status=resolved`}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full ${status === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Resolved
                </Link>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    Error loading complaints: {error.message}
                </div>
            ) : (
                <ComplaintList
                    complaints={complaints as any[] || []}
                    slug={slug}
                />
            )}
        </div>
    );
}
