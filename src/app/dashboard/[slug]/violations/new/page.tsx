'use client';

import { AlertTriangle, Upload, X } from 'lucide-react';

export default function ReportViolationPage({ params }: { params: { slug: string } }) {
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="text-red-600" />
                Report a Violation
            </h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Violation Type</label>
                    <select className="w-full p-2 border rounded-lg bg-white">
                        <option>Noise Complaint</option>
                        <option>Improper Parking</option>
                        <option>Pet Policy Violation</option>
                        <option>Trash Disposal Issue</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location / Unit Number</label>
                    <input type="text" className="w-full p-2 border rounded-lg" placeholder="e.g. Unit 302 or Pool Area" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea className="w-full p-2 border rounded-lg h-32" placeholder="Please describe the issue in detail..."></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evidence (Photos/Videos)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                    </div>
                </div>

                <button className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">
                    Submit Report
                </button>
            </div>
        </div>
    )
}
