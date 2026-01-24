import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            tenant_id,
            title,
            description,
            category_id,
            category,
            priority = 'MEDIUM'
        } = body;

        // Validate required fields
        if (!tenant_id || !title || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify user is an active member of the community
        const { data: membership } = await supabase
            .from('memberships')
            .select('role, status')
            .eq('tenant_id', tenant_id)
            .eq('user_id', user.id)
            .single();

        if (!membership || membership.status !== 'active') {
            return NextResponse.json(
                { error: 'You must be an active member to create service requests' },
                { status: 403 }
            );
        }

        // Create the service request
        const { data: serviceRequest, error: createError } = await supabase
            .from('service_requests')
            .insert({
                tenant_id,
                created_by: user.id,
                title,
                description,
                category_id,
                category,
                priority,
                status: 'OPEN'
            })
            .select(`
        *,
        creator:profiles!service_requests_created_by_fkey(id, full_name, avatar_url, email),
        category_info:service_categories(id, name, icon)
      `)
            .single();

        if (createError) {
            console.error('Error creating service request:', createError);
            return NextResponse.json(
                { error: 'Failed to create service request' },
                { status: 500 }
            );
        }

        // Log activity
        await supabase
            .from('service_request_activity')
            .insert({
                request_id: serviceRequest.id,
                user_id: user.id,
                action: 'created',
                details: {
                    title,
                    priority
                }
            });

        return NextResponse.json(serviceRequest, { status: 201 });
    } catch (error) {
        console.error('Error in create service request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
