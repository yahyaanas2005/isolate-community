import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            request_id,
            status,
            assigned_to,
            internal_notes,
            rating,
            feedback
        } = body;

        if (!request_id) {
            return NextResponse.json(
                { error: 'Request ID is required' },
                { status: 400 }
            );
        }

        // Get the service request to check permissions
        const { data: existingRequest } = await supabase
            .from('service_requests')
            .select('*, tenant_id, created_by')
            .eq('id', request_id)
            .single();

        if (!existingRequest) {
            return NextResponse.json(
                { error: 'Service request not found' },
                { status: 404 }
            );
        }

        // Check user's membership and role
        const { data: membership } = await supabase
            .from('memberships')
            .select('role, status')
            .eq('tenant_id', existingRequest.tenant_id)
            .eq('user_id', user.id)
            .single();

        if (!membership || membership.status !== 'active') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const isCreator = existingRequest.created_by === user.id;
        const isAssigned = existingRequest.assigned_to === user.id;
        const isStaffOrAbove = ['Owner', 'Admin', 'Sub-Admin', 'Staff'].includes(membership.role);

        // Build update object based on permissions
        const updates: any = { updated_at: new Date().toISOString() };

        // Creator can update rating and feedback
        if (isCreator && (rating !== undefined || feedback !== undefined)) {
            if (rating) updates.rating = rating;
            if (feedback) updates.feedback = feedback;
        }

        // Staff/assigned can update status, notes, assignment
        if (isStaffOrAbove || isAssigned) {
            if (status) {
                updates.status = status;
                if (status === 'CLOSED' || status === 'RESOLVED') {
                    updates.closed_at = new Date().toISOString();
                }
            }
            if (internal_notes !== undefined) updates.internal_notes = internal_notes;
            if (assigned_to !== undefined) updates.assigned_to = assigned_to;
        }

        // Update the service request
        const { data: updatedRequest, error: updateError } = await supabase
            .from('service_requests')
            .update(updates)
            .eq('id', request_id)
            .select(`
        *,
        creator:profiles!service_requests_created_by_fkey(id, full_name, avatar_url, email),
        assignee:profiles!service_requests_assigned_to_fkey(id, full_name, avatar_url, email),
        category_info:service_categories(id, name, icon)
      `)
            .single();

        if (updateError) {
            console.error('Error updating service request:', updateError);
            return NextResponse.json(
                { error: 'Failed to update service request' },
                { status: 500 }
            );
        }

        // Log activity
        const activityDetails: any = {};
        if (status) activityDetails.new_status = status;
        if (assigned_to) activityDetails.assigned_to = assigned_to;
        if (rating) activityDetails.rating = rating;

        await supabase
            .from('service_request_activity')
            .insert({
                request_id,
                user_id: user.id,
                action: status ? 'status_changed' : assigned_to ? 'assigned' : rating ? 'rated' : 'updated',
                details: activityDetails
            });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error('Error in update service request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
