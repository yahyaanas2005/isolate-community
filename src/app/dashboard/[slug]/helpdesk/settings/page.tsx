import SLAConfig from '@/components/complaints/SLAConfig';
import { getTenantBySlug } from '@/actions/shared';

export default async function HelpdeskSettingsPage({ params }: { params: { slug: string } }) {
    const tenant = await getTenantBySlug(params.slug);

    if (!tenant) return <div>Tenant not found</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Help Desk Settings</h1>
                <p className="text-muted-foreground">Configure service levels, automation, and preferences.</p>
            </div>

            <SLAConfig tenantId={tenant.id} />
        </div>
    );
}
