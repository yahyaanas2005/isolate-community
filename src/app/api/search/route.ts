
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    try {
        const { query, community_id } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Missing query' }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                results: [],
                message: "OpenAI Key missing. Search is in mock mode."
            });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // 1. Generate Embedding
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query,
        });
        const embedding = embeddingResponse.data[0].embedding;

        // 2. Search via Supabase RPC
        const supabase = await createClient();
        const { data: results, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.5, // Lowered slightly for better recall
            match_count: 5,
            filter_community_id: community_id
        });

        if (error) throw error;

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
