'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { createComplaint, ComplaintPriority } from '@/actions/complaints';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
}

export default function CreateComplaintDialog({
    tenantId,
    categories
}: {
    tenantId: string;
    categories: Category[];
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priority, setPriority] = useState<ComplaintPriority>('medium');
    const [location, setLocation] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!categoryId) {
            setError('Please select a category');
            setLoading(false);
            return;
        }

        try {
            const res = await createComplaint(tenantId, {
                title,
                description,
                category_id: categoryId,
                priority,
                location_details: location,
                is_emergency: isEmergency
            });

            if (res.error) {
                setError(res.error);
            } else {
                setOpen(false);
                // Reset form
                setTitle('');
                setDescription('');
                setCategoryId('');
                setPriority('medium');
                setLocation('');
                setIsEmergency(false);
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Raise Complaint
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Raise a New Complaint</DialogTitle>
                    <DialogDescription>
                        Submit a new issue to the help desk.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Topic / Title</label>
                        <Input
                            required
                            placeholder="e.g. Leaking faucet in master bath"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe the issue in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location (Optional)</label>
                            <Input
                                placeholder="e.g. Block A, Apt 101"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 border p-3 rounded-md bg-yellow-50 border-yellow-200">
                        <input
                            type="checkbox"
                            id="emergency"
                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            checked={isEmergency}
                            onChange={(e) => setIsEmergency(e.target.checked)}
                        />
                        <label htmlFor="emergency" className="text-sm font-medium text-yellow-800 flex items-center gap-1 cursor-pointer">
                            <AlertTriangle className="h-4 w-4" />
                            Mark as Emergency
                        </label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className={isEmergency ? 'bg-red-600 hover:bg-red-700' : ''}>
                            {loading ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
