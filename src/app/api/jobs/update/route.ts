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
        const { job_id, status, ...otherUpdates } = body;

        if (!job_id) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // Get the job post to check ownership
        const { data: existingJob } = await supabase
            .from('job_posts')
            .select('posted_by')
            .eq('id', job_id)
            .single();

        if (!existingJob) {
            return NextResponse.json(
                { error: 'Job post not found' },
                { status: 404 }
            );
        }

        if (existingJob.posted_by !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Build update object
        const updates: any = { ...otherUpdates, updated_at: new Date().toISOString() };

        if (status) {
            updates.status = status;
            if (status === 'CLOSED' || status === 'FILLED') {
                updates.closed_at = new Date().toISOString();
            }
        }

        // Update the job post
        const { data: updatedJob, error: updateError } = await supabase
            .from('job_posts')
            .update(updates)
            .eq('id', job_id)
            .select(`
        *,
        poster:profiles!job_posts_posted_by_fkey(id, full_name, avatar_url, email)
      `)
            .single();

        if (updateError) {
            console.error('Error updating job post:', updateError);
            return NextResponse.json(
                { error: 'Failed to update job post' },
                { status: 500 }
            );
        }

        return NextResponse.json(updatedJob);
    } catch (error) {
        console.error('Error in update job post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
