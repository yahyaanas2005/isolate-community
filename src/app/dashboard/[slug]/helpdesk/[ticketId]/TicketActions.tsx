'use client';

import { useState } from 'react';
import { updateTicketStatus, rateTicket } from '@/actions/helpdesk';
import { Ticket } from '@/lib/types/helpdesk';
import { Loader2, Star, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TicketActions({ ticket }: { ticket: Ticket }) {
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [rated, setRated] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: 'RESOLVED' | 'CLOSED') => {
        setLoading(true);
        try {
            await updateTicketStatus(ticket.id, newStatus);
            router.refresh();
        } catch (e) {
            alert('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async () => {
        if (rating === 0) return;
        setLoading(true);
        try {
            await rateTicket(ticket.id, rating, comment);
            setRated(true);
            router.refresh();
        } catch (e) {
            alert('Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
        if (rated) {
            return (
                <div className="text-center text-green-600 bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium">Thank you for your feedback!</p>
                </div>
            );
        }

        return (
            <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Rate Resolution</h4>
                <div className="flex gap-2 mb-3 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            <Star className="w-6 h-6 fill-current" />
                        </button>
                    ))}
                </div>
                <textarea
                    placeholder="Optional comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-sm border rounded-lg p-2 mb-3"
                    rows={2}
                />
                <button
                    onClick={handleRate}
                    disabled={loading || rating === 0}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit Rating'}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Simple resolving flow for MVP */}
            <button
                onClick={() => handleStatusChange('RESOLVED')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Mark as Resolved
            </button>
            <p className="text-xs text-center text-gray-500">
                Marking as resolved will enable rating.
            </p>
        </div>
    );
}
