
import { createClient } from '@/lib/supabase/server'; // Use server client
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    try {
        const { record } = await req.json();

        if (!record || (!record.body_excerpt && !record.title)) {
            return NextResponse.json({ message: 'No content to embed' }, { status: 200 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const input = `${record.title || ''} ${record.body_excerpt || ''}`.trim();

        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input,
        });

        const embedding = embeddingResponse.data[0].embedding;
        const supabase = await createClient();

        // We need to bypass RLS to update the embedding column for system actions
        // But @supabase/ssr server client uses cookies and user session, which is good.
        // However, if this is called by a webhook, we might need SERVICE_ROLE.
        // For MVP, let's assume this is called client-side after creation OR 
        // we use a dedicated service role client for this specific route if needed.
        // Simplest for now: User who created content triggers this, so they have RLS to update it.

        const { error } = await supabase
            .from('searchable_content')
            .update({ embedding })
            .eq('id', record.id);

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Embed API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
