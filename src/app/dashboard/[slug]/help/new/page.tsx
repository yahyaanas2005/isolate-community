'use client';

import { LifeBuoy } from 'lucide-react';

export default function NewTicketPage({ params }: { params: { slug: string } }) {
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <LifeBuoy className="w-6 h-6 text-blue-600" />
                Submit Support Ticket
            </h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <input className="w-full p-2 border rounded-lg" placeholder="Short summary of the issue" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select className="w-full p-2 border rounded-lg bg-white">
                            <option>Maintenance</option>
                            <option>Billing / Finance</option>
                            <option>Security</option>
                            <option>IT / App Support</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select className="w-full p-2 border rounded-lg bg-white">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Urgent</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea className="w-full p-2 border rounded-lg h-32" placeholder="Describe the issue..."></textarea>
                </div>

                <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg active:scale-[0.98]">
                    Submit Ticket
                </button>
            </div>
        </div>
    );
}
