'use client';

import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react'; // Using a placeholder div if package missing, check pkg.json?
// Actually simpler: Just display the text CODE for MVP.
// Or install `qrcode.react`. I'll try to use simple text code styling first.
// The user has `lucide-react`.

import { Ticket, Clock, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function VisitorPassList({ passes }: { passes: any[] }) {
    if (passes.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                <Ticket className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No active passes. Invite someone!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {passes.map((pass) => (
                <div key={pass.id} className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-indigo-600 p-4 text-white text-center py-6">
                        <div className="text-3xl font-mono font-bold tracking-widest bg-white/10 rounded py-2 px-4 inline-block backdrop-blur-sm border border-white/20">
                            {pass.pass_code}
                        </div>
                        <p className="text-xs uppercase tracking-wide mt-2 opacity-80">Entry Code</p>
                    </div>
                    <div className="p-4 space-y-3 flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-900">{pass.visitor_name}</h3>
                            <Badge variant="secondary" className="capitalize">{pass.visitor_type}</Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>Valid until {format(new Date(pass.valid_to), 'h:mm a, MMM d')}</span>
                            </div>
                            {pass.vehicle_no && (
                                <div className="flex items-center gap-2">
                                    <Car className="h-4 w-4 text-gray-400" />
                                    <span>{pass.vehicle_no}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <Badge variant={pass.status === 'active' ? 'default' : 'secondary'} className={pass.status === 'active' ? 'bg-green-600' : ''}>
                                {pass.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
