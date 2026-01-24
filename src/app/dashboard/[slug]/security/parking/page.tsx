'use client';

import { Car, AlertCircle, Filter } from 'lucide-react';

export default function ParkingPage() {
    const slots = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        number: `P-${100 + i}`,
        status: i % 3 === 0 ? 'OCCUPIED' : i % 5 === 0 ? 'RESERVED' : 'AVAILABLE',
        type: i % 5 === 0 ? 'VISITOR' : 'RESIDENT'
    }));

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Parking Management</h1>
                    <p className="text-gray-500">Manage allocations and visitor parking.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                        <Car className="w-4 h-4" /> Assign Slot
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Total Capacity</div>
                    <div className="text-2xl font-bold">120</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-green-600 text-xs uppercase font-bold tracking-wider mb-1">Available</div>
                    <div className="text-2xl font-bold text-green-700">42</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-blue-600 text-xs uppercase font-bold tracking-wider mb-1">Visitor Spots</div>
                    <div className="text-2xl font-bold text-blue-700">15</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-red-600 text-xs uppercase font-bold tracking-wider mb-1">Violations</div>
                    <div className="text-2xl font-bold text-red-700 font-mono">0</div>
                </div>
            </div>

            {/* Slot Grid */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 font-medium text-gray-700">Level B1</div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
                    {slots.map((slot) => (
                        <div
                            key={slot.id}
                            className={`relative p-3 rounded-lg border-2 flex flex-col items-center justify-center h-24 hover:shadow-md cursor-pointer transition-all ${slot.status === 'AVAILABLE' ? 'border-green-100 bg-green-50/50' :
                                    slot.status === 'OCCUPIED' ? 'border-gray-200 bg-gray-100 text-gray-400' :
                                        'border-yellow-200 bg-yellow-50'
                                }`}
                        >
                            <span className="text-lg font-bold text-gray-700">{slot.number}</span>
                            <span className={`text-[10px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded-full ${slot.type === 'VISITOR' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {slot.type}
                            </span>

                            {slot.status === 'OCCUPIED' && <Car className="absolute w-12 h-12 text-gray-300 opacity-20" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
