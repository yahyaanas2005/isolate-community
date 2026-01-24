'use client';

import { useState } from 'react';
import { MapPin, QrCode, CheckCircle, Navigation, AlertTriangle } from 'lucide-react';

export default function PatrolPage({ params }: { params: { slug: string } }) {
    const [activeRun, setActiveRun] = useState<boolean>(false);
    const [currentCheckpoint, setCurrentCheckpoint] = useState<number>(0);

    // Mock Data
    const route = {
        name: 'Perimeter Night Watch',
        checkpoints: [
            { id: 1, name: 'Main Gate', status: 'SCANNED', time: '22:00' },
            { id: 2, name: 'North Parking', status: 'PENDING', time: null },
            { id: 3, name: 'Clubhouse Rear', status: 'PENDING', time: null },
            { id: 4, name: 'Generator Room', status: 'PENDING', time: null },
        ]
    };

    const handleScan = () => {
        // Simulating a scan
        if (activeRun) {
            setCurrentCheckpoint(prev => prev + 1);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Patrol Mode</h1>
                <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${activeRun ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium text-gray-600">{activeRun ? 'Live' : 'Offline'}</span>
                </div>
            </div>

            {!activeRun ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Navigation className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold">Start Patrol</h2>
                    <p className="text-gray-500 text-sm">Select a route to begin your scheduled run.</p>
                    <select className="w-full p-2 border rounded-lg bg-gray-50 mb-4">
                        <option>Perimeter Night Watch</option>
                        <option>Building A - Internal</option>
                    </select>
                    <button
                        onClick={() => setActiveRun(true)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-transform"
                    >
                        Start Route
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Active Checkpoint Card */}
                    <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <MapPin className="w-24 h-24" />
                        </div>
                        <p className="text-blue-100 text-sm uppercase tracking-wider font-semibold mb-1">Target Checkpoint</p>
                        <h2 className="text-3xl font-bold mb-4">{route.checkpoints[currentCheckpoint]?.name || 'All Clear'}</h2>

                        {currentCheckpoint < route.checkpoints.length ? (
                            <button
                                onClick={handleScan}
                                className="w-full py-4 bg-white text-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
                            >
                                <QrCode className="w-5 h-5" />
                                Scan QR Code
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 bg-green-500/20 p-2 rounded-lg backdrop-blur-sm">
                                <CheckCircle className="w-5 h-5" />
                                <span>Patrol Complete</span>
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 font-medium text-sm text-gray-500">Checkpoint List</div>
                        <div className="divide-y">
                            {route.checkpoints.map((cp, idx) => (
                                <div key={cp.id} className={`p-4 flex items-center justify-between ${idx === currentCheckpoint ? 'bg-blue-50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${idx < currentCheckpoint ? 'bg-green-100 text-green-700' :
                                                idx === currentCheckpoint ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {idx < currentCheckpoint ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                        </div>
                                        <span className={idx < currentCheckpoint ? 'text-gray-500 line-through' : 'text-gray-900 font-medium'}>
                                            {cp.name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono text-gray-500">{cp.time || '--:--'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setActiveRun(false)}
                        className="w-full py-3 border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50"
                    >
                        Abort Patrol
                    </button>
                </div>
            )}
        </div>
    );
}
