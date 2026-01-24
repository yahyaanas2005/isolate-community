'use client';

import { Share2, FileWarning, CheckCircle } from 'lucide-react';

export default function IntegrationsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Integrations</h1>

            <div className="space-y-6">
                {/* Mailchimp */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-3 bg-yellow-100 text-yellow-700 rounded-lg">
                            <Share2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Mailchimp</h3>
                            <p className="text-sm text-gray-500 max-w-lg">Sync community members to your Mailchimp audience lists automatically. Send newsletters and campaigns.</p>
                            <div className="mt-3 flex gap-2">
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Connected
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Configure
                    </button>
                </div>

                {/* Tally */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
                            <FileWarning className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Tally (Accounting)</h3>
                            <p className="text-sm text-gray-500 max-w-lg">Export invoices, payments, and ledger entries to Tally XML format for accounting reconciliation.</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                        Connect
                    </button>
                </div>
            </div>
        </div>
    );
}
