
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { query, community_id } = await req.json();

        if (!query) {
            throw new Error("Missing query");
        }

        // 1. Generate Embedding for the query
        const configuration = new Configuration({ apiKey: Deno.env.get("OPENAI_API_KEY") });
        const openai = new OpenAIApi(configuration);

        // Fallback if key missing (mock mode for demo)
        if (!Deno.env.get("OPENAI_API_KEY")) {
            return new Response(JSON.stringify({
                results: [],
                message: "OpenAI Key missing. Search is in mock mode."
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const embeddingResponse = await openai.createEmbedding({
            model: "text-embedding-3-small",
            input: query,
        });
        const embedding = embeddingResponse.data.data[0].embedding;

        // 2. Search via RPC
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );

        const { data: results, error } = await supabase.rpc("match_documents", {
            query_embedding: embedding,
            match_threshold: 0.7, // Similarity threshold
            match_count: 5,
            filter_community_id: community_id
        });

        if (error) throw error;

        return new Response(JSON.stringify({ results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
