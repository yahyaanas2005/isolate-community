import GateScanner from '@/components/security/GateScanner';
import { createClient } from '@/utils/supabase/server';

interface GatePageProps {
    params: Promise<{ slug: string }>;
}

export default async function GatePage({ params }: GatePageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    const tenantId = tenant?.id || slug;

    return (
        <div className="p-6 h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50/50">
            <GateScanner tenantId={tenantId} />
        </div>
    );
}
