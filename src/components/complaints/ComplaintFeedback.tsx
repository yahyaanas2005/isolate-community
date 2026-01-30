'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { submitFeedback } from '@/actions/complaints';

interface ComplaintFeedbackProps {
    complaintId: string;
    existingFeedback?: any;
}

export function ComplaintFeedback({ complaintId, existingFeedback }: ComplaintFeedbackProps) {
    const [rating, setRating] = useState<number>(existingFeedback?.rating || 0);
    const [comment, setComment] = useState(existingFeedback?.feedback_text || '');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(!!existingFeedback);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setSubmitting(true);
        const res = await submitFeedback(complaintId, rating, comment);
        if (res.success) {
            setSubmitted(true);
        }
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                "w-6 h-6",
                                star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            )}
                        />
                    ))}
                </div>
                <p className="font-semibold text-green-800">Thank you for your feedback!</p>
                {comment && <p className="text-sm text-green-700 mt-1">"{comment}"</p>}
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">How was our service?</h3>
            <p className="text-sm text-gray-500 mb-4">Please rate the resolution of your complaint.</p>

            <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-transform hover:scale-110"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                    >
                        <Star
                            className={cn(
                                "w-8 h-8 transition-colors",
                                star <= (hoveredRating || rating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-200"
                            )}
                        />
                    </button>
                ))}
            </div>

            <textarea
                className="w-full min-h-[80px] rounded-md border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                placeholder="Any additional comments? (Optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />

            <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={rating === 0 || submitting}
            >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
        </div>
    );
}
