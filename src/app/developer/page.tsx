'use client';

import { Key, Copy, Check, Terminal } from 'lucide-react';
import { useState } from 'react';

export default function DeveloperPage() {
    const [copied, setCopied] = useState(false);
    const apiKey = 'ik_live_51M...xY2'; // Placeholder

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Developer Platform</h1>
                    <p className="text-gray-500">Build custom integrations with the Isolate API.</p>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-800">
                    <Terminal className="w-4 h-4" />
                    Read the Docs
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Quickstart */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Quickstart</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Authenticate your requests by including your secret API key in the `Authorization` header.
                        </p>
                        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 overflow-x-auto">
                            <span className="text-purple-400">curl</span> https://api.isolate.com/v1/members \<br />
                            &nbsp;&nbsp;<span className="text-yellow-400">-H</span> <span className="text-green-300">"Authorization: Bearer {apiKey}"</span>
                        </div>
                    </div>

                    {/* Endpoints */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 font-medium text-sm text-gray-700">Available Endpoints</div>
                        <div className="divide-y">
                            <div className="p-4 flex gap-4 items-center">
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">GET</span>
                                <code className="text-sm">/v1/members</code>
                                <span className="text-sm text-gray-500 ml-auto">List community members</span>
                            </div>
                            <div className="p-4 flex gap-4 items-center">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">POST</span>
                                <code className="text-sm">/v1/events</code>
                                <span className="text-sm text-gray-500 ml-auto">Create a new event</span>
                            </div>
                            <div className="p-4 flex gap-4 items-center">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">POST</span>
                                <code className="text-sm">/v1/webhooks</code>
                                <span className="text-sm text-gray-500 ml-auto">Register a webhook</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* API Keys */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Your API Keys
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Publishable Key</label>
                            <div className="mt-1 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                                <code className="text-xs flex-1 truncate text-gray-600">pk_live_289...12</code>
                                <Copy className="w-3 h-3 text-gray-400 cursor-pointer" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Secret Key</label>
                            <div className="mt-1 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                                <code className="text-xs flex-1 truncate text-gray-900 font-bold">sk_live_••••••••••••</code>
                                <button onClick={handleCopy}>
                                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Never share your secret key.</p>
                        </div>
                        <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Roll Key
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
