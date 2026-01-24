'use client';

import { useState } from 'react';
import { Bell, Trash2, Plus } from 'lucide-react';

export default function JobAlertsPage({ params }: { params: { slug: string } }) {
    const [alerts, setAlerts] = useState([
        { id: 1, keyword: 'Developer', frequency: 'Instant', lastSent: '2h ago' },
        { id: 2, keyword: 'Security Guard', frequency: 'Daily', lastSent: '1d ago' },
    ]);

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Job Alerts</h1>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Create Alert
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 divide-y overflow-hidden">
                {alerts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        No alerts set up.
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{alert.keyword}</h3>
                                    <p className="text-xs text-gray-500">Frequency: <span className="font-medium">{alert.frequency}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400">Last: {alert.lastSent}</span>
                                <button className="text-gray-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
