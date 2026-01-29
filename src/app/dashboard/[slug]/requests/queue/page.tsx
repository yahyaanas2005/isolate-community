import { getPendingApprovals } from '@/actions/approvals';
import ApprovalList from '@/components/approvals/ApprovalList';
import { createClient } from '@/utils/supabase/server';
import { ClipboardCheck } from 'lucide-react';

interface ApprovalPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ApprovalQueuePage({ params }: ApprovalPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    const tenantId = tenant?.id || slug;

    const approvals = await getPendingApprovals(tenantId);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardCheck className="w-7 h-7 text-indigo-600" />
                    Approval Queue
                </h1>
                <p className="text-sm text-gray-500">Review and action pending requests.</p>
            </div>

            <ApprovalList initialItems={approvals} tenantId={tenantId} />
        </div>
    );
}
