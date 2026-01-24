'use client';

import { Briefcase, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function JobDetailPage({ params }: { params: { slug: string; jobId: string } }) {
    const [applied, setApplied] = useState(false);

    const job = {
        id: params.jobId,
        title: 'Community Manager',
        company: 'Sunnyvale HOA',
        description: `We are looking for a dedicated Community Manager to oversee daily operations, manage resident requests, and coordinate events. 
    
    Responsibilities:
    - Respond to resident inquiries via the help board.
    - Coordinate with security staff.
    - Manage amenity bookings.`,
        requirements: [
            '2+ years experience in property management',
            'Strong communication skills',
            'Proficiency with Isolate Community OS'
        ],
        location: 'On-site',
        type: 'Part-time',
        salary: '$25/hr'
    };

    const handleApply = () => {
        // Logic to submit application
        setApplied(true);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 bg-gray-50">
                    <div className="flex gap-4 mb-4">
                        <div className="h-16 w-16 bg-white text-blue-600 rounded-xl shadow-sm flex items-center justify-center border border-gray-200">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                            <p className="text-lg text-gray-600">{job.company}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                            <MapPin className="w-4 h-4" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                            <Briefcase className="w-4 h-4" /> {job.type}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                            <DollarSign className="w-4 h-4" /> {job.salary}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                            <div className="prose text-gray-600 whitespace-pre-wrap">{job.description}</div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Requirements</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                {job.requirements.map((req, i) => (
                                    <li key={i}>{req}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">Apply Now</h3>
                            {applied ? (
                                <div className="bg-green-100 text-green-700 p-4 rounded-lg flex items-center gap-2 font-medium">
                                    <CheckCircle className="w-5 h-5" />
                                    Application Sent
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Upload Resume</label>
                                        <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    </div>
                                    <textarea
                                        placeholder="Cover Letter (Optional)"
                                        className="w-full p-2 border rounded-lg text-sm bg-white h-24"
                                    />
                                    <button
                                        onClick={handleApply}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 active:scale-[0.98]"
                                    >
                                        Submit Application
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
