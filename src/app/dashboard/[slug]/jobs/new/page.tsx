'use client';

import { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';

export default function PostJobPage({ params }: { params: { slug: string } }) {
    const [step, setStep] = useState(1);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input type="text" className="w-full p-2 border rounded-lg" placeholder="e.g. Maintenance Manager" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select className="w-full p-2 border rounded-lg bg-white">
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select className="w-full p-2 border rounded-lg bg-white">
                            <option>On-site</option>
                            <option>Remote</option>
                            <option>Hybrid</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea className="w-full p-2 border rounded-lg h-32" placeholder="Describe the role..."></textarea>
                </div>

                <button className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black">
                    Post Opportunity
                </button>
            </div>
        </div>
    )
}
