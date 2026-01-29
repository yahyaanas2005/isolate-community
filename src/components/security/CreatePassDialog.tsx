'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createVisitorPass } from '@/actions/security';
import { UserPlus, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatePassDialog({ tenantId }: { tenantId: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [type, setType] = useState('guest');
    const [hours, setHours] = useState(4);
    const [vehicle, setVehicle] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createVisitorPass(tenantId, {
            visitor_name: name,
            visitor_type: type,
            visit_type: 'one_time',
            valid_hours: hours,
            vehicle_no: vehicle
        });

        if (res.success) {
            setOpen(false);
            setName('');
            setVehicle('');
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <UserPlus className="mr-2 h-4 w-4" /> Invite Guest
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate Visitor Pass</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Visitor Name</label>
                        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="guest">Guest</option>
                                <option value="delivery">Delivery</option>
                                <option value="cab">Cab/Taxi</option>
                                <option value="service">Service</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Valid For</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                            >
                                <option value={2}>2 Hours</option>
                                <option value={4}>4 Hours</option>
                                <option value={12}>12 Hours</option>
                                <option value={24}>24 Hours</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Vehicle No (Optional)</label>
                        <Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="e.g. ABC-123" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Pass'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
