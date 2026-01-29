import { getNotifications } from '@/actions/notifications';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { createClient } from '@/utils/supabase/server';

interface NotificationsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function NotificationsPage({ params }: NotificationsPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single();
    const tenantId = tenant?.id || slug;

    // Fetch notifications
    const { data: notifications } = await getNotifications(tenantId);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <NotificationCenter initialNotifications={notifications || []} />
        </div>
    );
}
