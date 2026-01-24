'use client';

import { Book, Code, FileText, Search } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4 tracking-tight">How can we help?</h1>
                <div className="max-w-xl mx-auto relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search documentation..."
                        className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-100">
                        <Book className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">User Guide</h3>
                    <p className="text-gray-500 text-sm">Learn how to manage your community, invite members, and set up billing.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer group">
                    <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-100">
                        <Code className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Developer API</h3>
                    <p className="text-gray-500 text-sm">Integrate your own tools using our REST API. Generate keys and view endpoints.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 transition-colors cursor-pointer group">
                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-100">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">FAQ</h3>
                    <p className="text-gray-500 text-sm">Common questions about billing, security, and account management.</p>
                </div>
            </div>

            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
                <div className="grid gap-4">
                    {['Getting Started with Billing', 'Setting up the Guard Portal', 'How to Create a Poll', 'Connecting Mailchimp'].map((topic) => (
                        <div key={topic} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 cursor-pointer">
                            <span className="font-medium text-gray-700">{topic}</span>
                            <span className="text-blue-600 text-sm">Read &rarr;</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
