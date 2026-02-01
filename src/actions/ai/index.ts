'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function generateEmbedding(text: string) {
    if (!text) return null;

    // Normalize text (remove newlines usually helps)
    const content = text.replace(/\n/g, ' ');

    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: content,
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null; // Handle explicitly in caller
    }
}

export async function classifyTicketPriority(subject: string, description: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Cost effective for simple classification
            messages: [
                {
                    role: 'system',
                    content: `You are a Help Desk Triage AI. Analyze the ticket.
                    Output JSON only: { "priority": "low"|"medium"|"high"|"emergency", "category": "maintenance"|"security"|"finance"|"general", "reason": "brief reason" }`
                },
                {
                    role: 'user',
                    content: `Subject: ${subject}\nDescription: ${description}`
                }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    } catch (e) {
        console.error('AI Classification Failed:', e);
        return { priority: 'medium', category: 'general' }; // Fallback
    }
}
