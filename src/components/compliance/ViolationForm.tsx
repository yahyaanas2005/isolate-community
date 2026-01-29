'use client';

import { useState } from 'react';
import { reportViolation } from '@/actions/compliance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { AlertBase } from '@/components/ui/alert-base';

export default function ViolationForm({ tenantId }: { tenantId: string }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const res = await reportViolation(tenantId, {
            type: formData.get('type') as string,
            details: formData.get('details') as string,
            offenderName: formData.get('offender') as string
        });

        if (res.success) {
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                <h3 className="font-bold">Report Submitted</h3>
                <p>Thank you for keeping the community safe. The admin will review it.</p>
                <Button variant="link" onClick={() => setSuccess(false)} className="px-0">Report another</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border">
            <div>
                <label className="block text-sm font-medium mb-1">Violation Type</label>
                <select name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="noise">Noise Complaint</option>
                    <option value="parking">Parking Violation</option>
                    <option value="trash">Improper Trash Disposal</option>
                    <option value="pet">Pet Issue</option>
                    <option value="construction">Unauthorized Construction</option>
                    <option value="behavior">Harassment/Behavior</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Details</label>
                <textarea
                    name="details"
                    placeholder="Describe what happened..."
                    required
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Offender (If known)</label>
                <Input name="offender" placeholder="Unit number or Name" />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
        </form>
    );
}
