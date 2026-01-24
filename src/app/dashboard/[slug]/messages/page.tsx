'use client';

import { useState } from 'react';
import { Send, Image as ImageIcon, Search, MessageCircle } from 'lucide-react';

export default function MessagesPage() {
    const [activeChat, setActiveChat] = useState<number | null>(1);

    const conversations = [
        { id: 1, name: 'Sarah J.', lastMessage: 'Is the sofa still available?', time: '2m ago', unread: 1, avatar: 'S' },
        { id: 2, name: 'Mike Ross', lastMessage: 'Thanks for the bike!', time: '1d ago', unread: 0, avatar: 'M' },
        { id: 3, name: 'Guard Station', lastMessage: 'Package arrived for you.', time: '2d ago', unread: 0, avatar: 'G' },
    ];

    const messages = [
        { id: 1, sender: 'them', text: 'Hi! I saw your listing for the sofa.', time: '10:00 AM' },
        { id: 2, sender: 'me', text: 'Yes, it is still available.', time: '10:05 AM' },
        { id: 3, sender: 'them', text: 'Can I come see it today at 5pm?', time: '10:15 AM' },
    ];

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50 -m-6">
            {/* Sidebar List */}
            <div className="w-80 bg-white border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-xl mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input placeholder="Search chats..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChat(chat.id)}
                            className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${activeChat === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                        >
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                                {chat.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`text-sm truncate ${activeChat === chat.id ? 'font-bold text-blue-900' : 'font-medium text-gray-900'}`}>{chat.name}</h3>
                                    <span className="text-xs text-gray-400">{chat.time}</span>
                                </div>
                                <p className={`text-xs truncate ${chat.unread ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {activeChat ? (
                    <>
                        <div className="p-4 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm text-gray-600">S</div>
                                <span className="font-bold">Sarah J.</span>
                            </div>
                            <button className="text-sm text-blue-600 font-medium hover:underline">View Profile</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === 'me'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                        <div className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t bg-white">
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <input
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
