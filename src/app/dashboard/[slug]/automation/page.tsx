'use client';

import { Zap, Plus, ArrowRight } from 'lucide-react';

export default function AutomationPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Automation Rules</h1>
                    <p className="text-muted-foreground">Create "If This, Then That" workflows to save time.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    New Workflow
                </button>
            </div>

            <div className="grid gap-4">
                {/* Active Workflow Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Welcome New Members</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">IF Member Join</span>
                                <ArrowRight className="w-3 h-3" />
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">THEN Send Email</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                        <button className="text-sm text-gray-500 hover:text-gray-900">Edit</button>
                    </div>
                </div>

                {/* Inactive Workflow Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between relative overflow-hidden group opacity-75">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300"></div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 text-gray-400 rounded-lg">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Alert Guard on High Traffic</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">IF &gt; 10 Visitors</span>
                                <ArrowRight className="w-3 h-3" />
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">THEN Notify Admin</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Paused</span>
                        <button className="text-sm text-gray-500 hover:text-gray-900">Edit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
