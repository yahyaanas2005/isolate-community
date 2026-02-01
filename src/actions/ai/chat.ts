'use server';

import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { generateEmbedding } from './index';
import { SYSTEM_MANIFEST, AVAILABLE_TOOLS } from '@/lib/ai/systemManifest';

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TOOL IMPLEMENTATIONS ---------------------------------------------------------
async function tool_getTicketStatus(tenantId: string, userId: string, ticketId?: string) {
    const supabase = await createClient();
    let query = supabase.from('complaints').select('complaint_no, title, status, priority, description').eq('tenant_id', tenantId);

    if (ticketId && ticketId !== 'latest') {
        query = query.or(`complaint_no.eq.${ticketId},id.eq.${ticketId}`);
    } else {
        // Get latest
        query = query.eq('reported_by', userId).order('created_at', { ascending: false }).limit(1);
    }

    const { data } = await query.single();
    if (!data) return "I couldn't find that ticket.";
    return `Ticket ${data.complaint_no} "${data.title}" is currently **${data.status}**. Details: ${data.description}`;
}

async function tool_createTicket(tenantId: string, userId: string, args: any) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('complaints').insert({
        tenant_id: tenantId,
        reported_by: userId,
        title: args.title,
        description: args.description,
        priority: args.priority || 'low',
        category_id: null,
        status: 'new',
        complaint_no: `AI-${Date.now().toString().slice(-4)}`
    }).select().single();

    if (error) return "Failed to create ticket: " + error.message;
    return `✅ Ticket Created! Reference: **${data.complaint_no}**. I've logged your request.`;
}

async function tool_listCommunities(userId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('memberships')
        .select('tenant:tenants(name, slug), role')
        .eq('user_id', userId);

    if (!data || data.length === 0) return "You're not a member of any communities yet.";

    const list = data.map((m: any) => `• **${m.tenant.name}** (${m.role})`);
    return `You're a member of ${data.length} community(ies):\n${list.join('\n')}`;
}

async function tool_createEvent(tenantId: string, userId: string, args: any) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('announcements').insert({
        tenant_id: tenantId,
        created_by: userId,
        title: args.title,
        body: args.description || 'Event details to be announced.',
        type: 'general',
        priority: 'normal',
        status: 'published',
        published_at: new Date().toISOString()
    }).select().single();

    if (error) return "Failed to create event: " + error.message;
    return `🎉 Event **${args.title}** created! View it in Notices.`;
}
// ------------------------------------------------------------------------------

export async function chatWithCoordinator(
    tenantSlug: string,
    messages: { role: 'user' | 'assistant' | 'system', content: string }[]
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "Please log in to chat.", history: messages };

    // Resolve Tenant ID from Slug
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single();
    if (!tenant) return { message: "Invalid Community.", history: messages };
    const tenantId = tenant.id;

    const lastUserMessage = messages[messages.length - 1].content;

    // 1. RAG: Search Knowledge Base
    const embedding = await generateEmbedding(lastUserMessage);
    let contextText = "";

    if (embedding) {
        // Search knowledge_docs
        // Note: Function rpc needs to be defined in SQL, but for now we'll do a robust check
        // Or if we don't have rpc yet, we skip RAG or rely on the SYSTEM_MANIFEST injected validly.

        // Let's inject the SYSTEM_MANIFEST directly into context for MVP if vector search isn't ready.
        // It's small enough.
        contextText = SYSTEM_MANIFEST.map(m => `- ${m.title}: ${m.content}`).join('\n');
    }

    // 2. Chat Completion with Tools
    try {
        const systemPrompt = `You are Cora, the Community Coordinator AI for ${tenantId}.

Your Personality:
- Friendly, professional, and action-oriented
- Speak like a helpful neighbor, not a robot
- Be concise (2-3 sentences max)
- Use emojis sparingly for warmth

What You MUST Do:
1. ALWAYS use tools when users ask for actions ("create", "check", "show")
2. NEVER give long instructions - EXECUTE THE ACTION
3. If user asks "create event" → use create_event tool immediately
4. If user asks "my communities" → use list_communities tool

Knowledge (Use this to answer questions):
${contextText}

Current Context:
User ID: ${user.id}
Tenant: ${tenantId}

Examples:
User: "create event for pool party"
You: [USE create_event] then say "🎉 Done! Event created."

User: "how many communities am I in?"
You: [USE list_communities] then show the list.`;

        const openAiMessages: any[] = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({
                role: m.role as any,
                content: m.content
            }))
        ];

        const openai = getOpenAI();
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview', // Smart model for tools
            messages: openAiMessages,
            tools: AVAILABLE_TOOLS.map(t => ({
                type: 'function',
                function: { name: t.name, description: t.description, parameters: t.parameters }
            })),
            tool_choice: 'auto'
        });

        const msg = response.choices[0].message;

        // 3. Handle Tool Calls
        if (msg.tool_calls) {
            const toolResults = [];
            for (const rawToolCall of msg.tool_calls) {
                const toolCall = rawToolCall as any;
                const args = JSON.parse(toolCall.function.arguments);
                let output = "Tool execution failed.";

                if (toolCall.function.name === 'get_ticket_status') {
                    output = await tool_getTicketStatus(tenantId, user.id, args.ticketId);
                } else if (toolCall.function.name === 'create_ticket') {
                    output = await tool_createTicket(tenantId, user.id, args);
                } else if (toolCall.function.name === 'list_communities') {
                    output = await tool_listCommunities(user.id);
                } else if (toolCall.function.name === 'create_event') {
                    output = await tool_createEvent(tenantId, user.id, args);
                }

                toolResults.push({
                    role: 'tool' as const,
                    tool_call_id: toolCall.id,
                    content: output
                });
            }

            // Client needs to see this process or we handle it recursively?
            // Simple recursive for single turn:
            const secondResponse = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    ...openAiMessages,
                    msg,
                    ...toolResults
                ]
            });

            return {
                message: secondResponse.choices[0].message.content,
                history: [
                    ...messages,
                    { role: 'assistant', content: secondResponse.choices[0].message.content }
                ]
            };
        }

        return {
            message: msg.content,
            history: [...messages, { role: 'assistant', content: msg.content }]
        };

    } catch (e: any) {
        console.error("AI Chat Error:", e);
        return { message: "I'm having trouble connecting to the brain. " + e.message, history: messages };
    }
}
