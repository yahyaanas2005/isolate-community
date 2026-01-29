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
import { UserPlus } from 'lucide-react';
import { inviteMember } from '@/actions/members';
import { Tenant, UserRole } from '@/lib/types';

export default function AddMemberDialog({ tenant }: { tenant: Tenant }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<string>('Member'); // Simplified for now, should use roles table later
    const [message, setMessage] = useState<string | null>(null);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const result = await inviteMember(tenant.id, email, role);
            if (result.success) {
                setMessage('Invitation sent successfully!');
                setTimeout(() => {
                    setOpen(false);
                    setMessage(null);
                    setEmail('');
                }, 1500);
            } else {
                setMessage(result.error || 'Failed to helper');
            }
        } catch (error) {
            setMessage('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" /> Add Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Member to {tenant.name}</DialogTitle>
                    <DialogDescription>
                        Invite a new member to this community.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleInvite} className="space-y-4 py-2">
                    {message && (
                        <div className={`p-3 text-sm rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                            placeholder="member@example.com"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        {/* Native select for simplicity with shadcn styling */}
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="Member">Member</option>
                            <option value="Staff">Staff</option>
                            <option value="Admin">Admin</option>
                            <option value="Owner">Owner</option>
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
