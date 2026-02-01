'use server';

import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { generateEmbedding } from './index';
import { SYSTEM_MANIFEST, AVAILABLE_TOOLS } from '@/lib/ai/systemManifest';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    // We reuse the existing createComplaint action logic ideally, but for now direct insert for speed
    const supabase = await createClient();
    const { data, error } = await supabase.from('complaints').insert({
        tenant_id: tenantId,
        reported_by: userId,
        title: args.title,
        description: args.description,
        priority: args.priority || 'low',
        category_id: null, // AI doesn't know categories yet, maybe default or try to find?
        status: 'new',
        complaint_no: `AI-${Date.now().toString().slice(-4)}`
    }).select().single();

    if (error) return "Failed to create ticket: " + error.message;
    return `Ticket Created! Reference: ${data.complaint_no}.`;
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
        const systemPrompt = `You are the Community Coordinator AI. 
        You help residents and staff. 
        Current User ID: ${user.id}
        Tenant ID: ${tenantId}
        
        KNOWLEDGE BASE:
        ${contextText}
        
        Refuse to answer questions outside of community management.
        If asked to perform an action, use the available tools.
        Keep answers concise and helpful.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview', // Smart model for tools
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
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
            for (const toolCall of msg.tool_calls) {
                // @ts-ignore
                const args = JSON.parse(toolCall.function.arguments);
                let output = "Tool execution failed.";

                if (toolCall.function.name === 'get_ticket_status') {
                    output = await tool_getTicketStatus(tenantId, user.id, args.ticketId);
                } else if (toolCall.function.name === 'create_ticket') {
                    output = await tool_createTicket(tenantId, user.id, args);
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
                    { role: 'system', content: systemPrompt },
                    // @ts-ignore
                    ...messages,
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
