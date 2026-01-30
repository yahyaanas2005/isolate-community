'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function DashboardRootPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function resolveRoute() {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    router.push('/login');
                    return;
                }

                // Fetch user's memberships to find where to redirect
                const { data: memberships, error } = await supabase
                    .from('memberships')
                    .select('tenant_id, tenants(slug)')
                    .eq('user_id', session.user.id)
                    .limit(1);

                if (error || !memberships || memberships.length === 0) {
                    router.push('/welcome');
                } else {
                    // Redirect to the first community found
                    // @ts-ignore
                    const slug = memberships[0].tenants?.slug;
                    if (slug) {
                        router.push(`/dashboard/${slug}`);
                    } else {
                        router.push('/onboarding');
                    }
                }
            } catch (e) {
                console.error('Routing error:', e);
                router.push('/login');
            }
        }

        resolveRoute();
    }, [router, supabase]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Redirecting to your community...</p>
            </div>
        </div>
    );
}
