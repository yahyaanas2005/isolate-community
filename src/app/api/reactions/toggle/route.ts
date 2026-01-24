import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/reactions/toggle
 * Toggle a reaction on a post or comment
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
        const { post_id, comment_id, emoji } = body;

        // Validation
        if (!emoji || (!post_id && !comment_id)) {
            return NextResponse.json(
                { error: 'Missing required fields: emoji and (post_id or comment_id)' },
                { status: 400 }
            );
        }

        // Check if reaction already exists
        let query = supabase
            .from('reactions')
            .select('id')
            .eq('user_id', user.id)
            .eq('emoji', emoji);

        if (post_id) {
            query = query.eq('post_id', post_id).is('comment_id', null);
        } else {
            query = query.eq('comment_id', comment_id).is('post_id', null);
        }

        const { data: existing } = await query.single();

        if (existing) {
            // Remove reaction (toggle off)
            const { error: deleteError } = await supabase
                .from('reactions')
                .delete()
                .eq('id', existing.id);

            if (deleteError) {
                console.error('Error deleting reaction:', deleteError);
                return NextResponse.json(
                    { error: 'Failed to remove reaction' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                action: 'removed'
            });
        } else {
            // Add reaction (toggle on)
            const { error: insertError } = await supabase
                .from('reactions')
                .insert({
                    user_id: user.id,
                    post_id: post_id || null,
                    comment_id: comment_id || null,
                    emoji
                });

            if (insertError) {
                console.error('Error adding reaction:', insertError);
                return NextResponse.json(
                    { error: 'Failed to add reaction' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                action: 'added'
            });
        }

    } catch (error) {
        console.error('Error toggling reaction:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
