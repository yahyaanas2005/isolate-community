'use client';

import { AlertTriangle, User, MapPin, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ViolationDetailPage({ params }: { params: { slug: string; violationId: string } }) {
    const [fineIssued, setFineIssued] = useState(false);

    const violation = {
        id: params.violationId,
        type: 'Noise Complaint',
        description: 'Loud music playing after 11 PM on a weeknight.',
        location: 'Unit 402',
        reportedBy: 'John Doe',
        offender: 'Unknown / Unit 402 Tenant',
        status: 'OPEN',
        evidence: ['https://via.placeholder.com/150'],
        severity: 'MEDIUM'
    };

    return (
        <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{violation.type}</h1>
                            <p className="text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4" /> {violation.location}
                            </p>
                        </div>
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {violation.severity}
                        </span>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 mb-6">{violation.description}</p>

                    <h3 className="font-bold text-sm text-gray-900 mb-2">Evidence</h3>
                    <div className="flex gap-2">
                        {violation.evidence.map((src, i) => (
                            <div key={i} className="h-24 w-24 bg-gray-100 rounded-lg border border-gray-200"></div>
                        ))}
                    </div>
                </div>

                {/* Activity Log Placeholder */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Activity Log</h3>
                    <div className="text-sm text-gray-500 italic">No updates yet.</div>
                </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Admin Actions</h3>

                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                            <CheckCircle className="w-4 h-4 text-green-600" /> Mark Resolved
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                            <XCircle className="w-4 h-4 text-gray-500" /> Dismiss
                        </button>
                    </div>

                    <hr className="my-6 border-gray-100" />

                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Issue Fine
                    </h3>

                    {!fineIssued ? (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Amount ($)</label>
                                <input type="number" className="w-full mt-1 p-2 border rounded bg-gray-50" defaultValue="50" />
                            </div>
                            <button
                                onClick={() => setFineIssued(true)}
                                className="w-full py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 text-sm"
                            >
                                Issue Fine
                            </button>
                        </div>
                    ) : (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium text-center border border-red-100">
                            Fine Issued: $50.00
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm">Offender Details</h3>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Unit 402</p>
                            <p className="text-xs text-gray-500">Tenant (Unknown)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
