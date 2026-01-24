import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/comments/create
 * Create a new comment on a post
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
        const { post_id, content, parent_id } = body;

        // Validation
        if (!post_id || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: post_id, content' },
                { status: 400 }
            );
        }

        // Verify user can access this post (RLS will handle this, but double check)
        const { data: post } = await supabase
            .from('posts')
            .select('tenant_id')
            .eq('id', post_id)
            .single();

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Create comment
        const { data: comment, error: commentError } = await supabase
            .from('comments')
            .insert({
                post_id,
                author_id: user.id,
                content,
                parent_id: parent_id || null
            })
            .select(`
        *,
        author:profiles(id, full_name, avatar_url, email)
      `)
            .single();

        if (commentError) {
            console.error('Error creating comment:', commentError);
            return NextResponse.json(
                { error: 'Failed to create comment' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            comment
        });

    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
