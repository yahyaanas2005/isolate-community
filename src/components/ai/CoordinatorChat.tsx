'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Send, X, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { chatWithCoordinator } from '@/actions/ai/chat';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function CoordinatorChat() {
    const params = useParams();
    const tenantId = params?.slug as string; // Ideally we pass real tenant ID, but slug might need resolving or we fetch in layout
    // Wait, chatWithCoordinator needs tenantId (db uuid) not slug. 
    // This component needs to know the tenantId.
    // We'll pass it as a prop from the Layout or resolve it via a server wrapper.
    // For now, let's assume this is rendered inside a context where we can get it, 
    // Or we update the action to accept Slug.

    // UPDATE: chatWithCoordinator takes tenantId. 
    // We will create a wrapper or just use a prop.
    // Let's assume we pass the slug to the Action and the Action resolves it.
    // But Action defined tenantId.
    // I'll update the Action to take slug for safety/ease from client.

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'system', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Call Server Action
        // Note: passing SLUG as tenantId for now, action needs to handle it or we rename param
        const res = await chatWithCoordinator(tenantId, [...messages, userMsg]);

        if (res && res.message) {
            setMessages(prev => [...prev, { role: 'assistant', content: res.message! }]);
        }
        setLoading(false);
    };

    if (!tenantId) return null; // Don't show if not in dashboard

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

            {isOpen && (
                <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl border-blue-100 animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Community Agent</h3>
                                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    Online
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="text-center mt-10 space-y-3">
                                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                    <Sparkles className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                                    Hi! I can help you check tickets, book amenities, or answer questions about the community.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Button variant="outline" size="sm" onClick={() => setInput("What is the wifi password?")}>Wifi?</Button>
                                    <Button variant="outline" size="sm" onClick={() => setInput("Check my ticket status")}>My Tickets</Button>
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                    m.role === 'user'
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white border text-gray-800 rounded-bl-none"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t flex gap-2">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask or command..."
                            className="focus-visible:ring-1"
                        />
                        <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            )}

            {!isOpen && (
                <Button
                    className="h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageSquare className="w-7 h-7" />
                </Button>
            )}
        </div>
    );
}
