'use client';

import { CheckSquare, Clock } from 'lucide-react';
import { useState } from 'react';

export default function MeetingPage({ params }: { params: { slug: string; meetingId: string } }) {
    const [activeTab, setActiveTab] = useState('minutes');

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="border-b pb-4">
                <div className="text-sm text-gray-500 mb-1">Finance Committee</div>
                <h1 className="text-3xl font-bold">Q1 Budget Review</h1>
                <p className="text-gray-500 mt-2">February 15, 2026 • 7:00 PM • Clubhouse Meeting Room</p>
            </div>

            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab('minutes')}
                    className={`pb-2 text-sm font-medium ${activeTab === 'minutes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Minutes & Notes
                </button>
                <button
                    onClick={() => setActiveTab('actions')}
                    className={`pb-2 text-sm font-medium ${activeTab === 'actions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Action Items
                </button>
            </div>

            {activeTab === 'minutes' ? (
                <div className="bg-white border rounded-xl p-8 min-h-[400px] prose">
                    <h3>Meeting Called to Order</h3>
                    <p>The meeting was called to order at 7:05 PM by Chair Alice Freeman.</p>
                    <h3>Agenda Item 1: 2026 Budget Approval</h3>
                    <p>The committee reviewed the proposed budget. Several line items were discussed regarding pool maintenance costs.</p>
                    <ul>
                        <li>Motion to approve base budget: Passed (3-0)</li>
                        <li>Motion to increase reserve contribution: Passed (3-0)</li>
                    </ul>
                    <h3>Adjournment</h3>
                    <p>Meeting adjourned at 8:15 PM.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white border rounded-xl p-4 flex items-center gap-4">
                        <div className="h-6 w-6 rounded border-2 border-gray-300"></div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900">Get quotes for pool resurfacing</h4>
                            <p className="text-sm text-gray-500">Assigned to: Bob Smith • Due: Feb 28</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">IN PROGRESS</span>
                    </div>
                    <div className="bg-white border rounded-xl p-4 flex items-center gap-4 opacity-50">
                        <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white"><CheckSquare className="w-4 h-4" /></div>
                        <div className="flex-1 line-through">
                            <h4 className="font-bold text-gray-900">Email budget PDF to residents</h4>
                            <p className="text-sm text-gray-500">Assigned to: Alice Freeman • Due: Feb 16</p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">DONE</span>
                    </div>
                </div>
            )}
        </div>
    );
}
