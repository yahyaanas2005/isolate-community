import { getMyVisitorPasses } from '@/actions/security';
import CreatePassDialog from '@/components/security/CreatePassDialog';
import VisitorPassList from '@/components/security/VisitorPassList';
import { createClient } from '@/utils/supabase/server';
import { ShieldCheck } from 'lucide-react';

interface VisitorsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function VisitorsPage({ params }: VisitorsPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    const tenantId = tenant?.id || slug;

    // Fetch passes
    const { data: passes } = await getMyVisitorPasses(tenantId);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7 text-indigo-600" />
                        My Visitors
                    </h1>
                    <p className="text-sm text-gray-500">Manage entry passes for your guests.</p>
                </div>
                <CreatePassDialog tenantId={tenantId} />
            </div>

            <div className="bg-white p-6 rounded-xl border">
                <h2 className="text-lg font-semibold mb-4">Active Passes</h2>
                <VisitorPassList passes={passes || []} />
            </div>
        </div>
    );
}
