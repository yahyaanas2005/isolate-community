'use client';

import { Save, Send } from 'lucide-react';

export default function NewCampaignPage({ params }: { params: { slug: string } }) {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                            <input className="w-full p-2 border rounded-lg" placeholder="e.g. Summer Newsletter" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject Line</label>
                            <input className="w-full p-2 border rounded-lg" placeholder="Enter a catchy subject..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea className="w-full p-2 border rounded-lg h-64 font-mono text-sm" placeholder="<html>...</html> or plain text"></textarea>
                            <p className="text-xs text-gray-500 mt-1">Supports HTML/Markdown</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h3 className="font-bold text-gray-900">Delivery</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Audience Segment</label>
                            <select className="w-full p-2 border rounded-lg bg-white">
                                <option>All Residents</option>
                                <option>Owners Only</option>
                                <option>Tenants Only</option>
                                <option>Board Members</option>
                            </select>
                        </div>

                        <hr />

                        <div className="flex flex-col gap-3">
                            <button className="w-full py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-gray-50">
                                <Save className="w-4 h-4" /> Save Draft
                            </button>
                            <button className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-blue-700 shadow-sm">
                                <Send className="w-4 h-4" /> Send Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
