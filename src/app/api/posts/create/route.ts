import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/posts/create
 * Create a new post in a community
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { tenant_id, group_id, title, content, category, tags } = body;

        // Validation
        if (!tenant_id || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: tenant_id, content' },
                { status: 400 }
            );
        }

        // Verify user is a member of the community
        const { data: membership } = await supabase
            .from('memberships')
            .select('status')
            .eq('user_id', user.id)
            .eq('tenant_id', tenant_id)
            .single();

        if (!membership || membership.status !== 'active') {
            return NextResponse.json(
                { error: 'You must be an active member to post in this community' },
                { status: 403 }
            );
        }

        // Create post
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert({
                tenant_id,
                author_id: user.id,
                group_id: group_id || null,
                title: title || null,
                content,
                category: category || null,
                tags: tags || [],
                is_pinned: false,
                attachments: []
            })
            .select(`
        *,
        author:profiles(id, full_name, avatar_url, email)
      `)
            .single();

        if (postError) {
            console.error('Error creating post:', postError);
            return NextResponse.json(
                { error: 'Failed to create post' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            post
        });

    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
