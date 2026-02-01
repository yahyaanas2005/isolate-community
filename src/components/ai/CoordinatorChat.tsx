'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Send, X, MessageSquare, Loader2, Sparkles, User } from 'lucide-react';
import { chatWithCoordinator } from '@/actions/ai/chat';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function CoordinatorChat() {
    const params = useParams();
    const tenantSlug = params?.slug as string;

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

        const res = await chatWithCoordinator(tenantSlug, [...messages, userMsg]);

        if (res && res.message) {
            setMessages(prev => [...prev, { role: 'assistant', content: res.message! }]);
        }
        setLoading(false);
    };

    if (!tenantSlug) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

            {isOpen && (
                <Card className="w-[380px] h-[550px] flex flex-col shadow-2xl border-0 animate-in slide-in-from-bottom-5 overflow-hidden" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                    {/* Header */}
                    <div className="p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="bg-white/30 backdrop-blur-sm p-2 rounded-full ring-2 ring-white/50">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">Cora</h3>
                                <p className="text-[11px] text-white/90 flex items-center gap-1.5">
                                    Community Assistant
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={() => setIsOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white/95 to-white" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="text-center mt-12 space-y-4">
                                <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                    <Sparkles className="w-8 h-8 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-700 font-medium mb-2">
                                        👋 Hi! I'm Cora, your community assistant
                                    </p>
                                    <p className="text-xs text-gray-500 max-w-[260px] mx-auto leading-relaxed">
                                        I can help you create events, check tickets, or answer questions about your community.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center pt-2">
                                    <button
                                        className="px-3 py-1.5 text-xs bg-white border border-purple-200 text-purple-700 rounded-full hover:bg-purple-50 transition-colors font-medium shadow-sm"
                                        onClick={() => setInput("How many communities am I in?")}
                                    >
                                        My Communities
                                    </button>
                                    <button
                                        className="px-3 py-1.5 text-xs bg-white border border-blue-200 text-blue-700 rounded-full hover:bg-blue-50 transition-colors font-medium shadow-sm"
                                        onClick={() => setInput("Check my latest ticket")}
                                    >
                                        Check Tickets
                                    </button>
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={cn("flex gap-2", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                                {m.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-md",
                                    m.role === 'user'
                                        ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm"
                                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                                )}>
                                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                                </div>
                                {m.role === 'user' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask or command me..."
                            className="focus-visible:ring-purple-500 border-gray-200"
                        />
                        <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            )}

            {!isOpen && (
                <Button
                    className="h-16 w-16 rounded-full shadow-2xl transition-all hover:scale-110 group relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                    onClick={() => setIsOpen(true)}
                >
                    <MessageSquare className="w-8 h-8 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            )}
        </div>
    );
}
