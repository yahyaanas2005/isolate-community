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
            company_name,
            requirements,
            location,
            remote_allowed = false,
            job_type,
            salary_range,
            application_email,
            application_url
        } = body;

        // Validate required fields
        if (!tenant_id || !title || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify user is an active member
        const { data: membership } = await supabase
            .from('memberships')
            .select('status')
            .eq('tenant_id', tenant_id)
            .eq('user_id', user.id)
            .single();

        if (!membership || membership.status !== 'active') {
            return NextResponse.json(
                { error: 'You must be an active member to post jobs' },
                { status: 403 }
            );
        }

        // Create the job post
        const { data: jobPost, error: createError } = await supabase
            .from('job_posts')
            .insert({
                tenant_id,
                posted_by: user.id,
                title,
                description,
                company_name,
                requirements,
                location,
                remote_allowed,
                job_type,
                salary_range,
                application_email,
                application_url,
                status: 'OPEN'
            })
            .select(`
        *,
        poster:profiles!job_posts_posted_by_fkey(id, full_name, avatar_url, email)
      `)
            .single();

        if (createError) {
            console.error('Error creating job post:', createError);
            return NextResponse.json(
                { error: 'Failed to create job post' },
                { status: 500 }
            );
        }

        return NextResponse.json(jobPost, { status: 201 });
    } catch (error) {
        console.error('Error in create job post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
