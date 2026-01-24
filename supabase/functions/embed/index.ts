
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { record } = await req.json();

        // Only proceed if there is text to embed and no embedding yet
        if (!record.body_excerpt && !record.title) {
            return new Response("No content to embed", { status: 200 });
        }

        const input = \`\${record.title || ''} \${record.body_excerpt || ''}\`.trim();

    const configuration = new Configuration({ apiKey: Deno.env.get("OPENAI_API_KEY") });
    const openai = new OpenAIApi(configuration);

    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-3-small",
      input,
    });

    const embedding = embeddingResponse.data.data[0].embedding;

    // Update the record with the embedding
    const { error } = await supabase
      .from("searchable_content")
      .update({ embedding })
      .eq("id", record.id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
