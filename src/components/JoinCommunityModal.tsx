'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

interface JoinCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function JoinCommunityModal({ isOpen, onClose }: JoinCommunityModalProps) {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('/api/communities/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to join community');
                setLoading(false);
                return;
            }

            // Success!
            setSuccess(true);
            setCode('');

            // Delay to show success message
            setTimeout(() => {
                onClose();
                router.refresh(); // Refresh to show new community
                setSuccess(false);
            }, 1500);

        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setCode('');
            setError('');
            setSuccess(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full relative">
                {/* Close Button */}
                {!loading && (
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <h2 className="text-2xl font-bold mb-2">Join Community</h2>
                <p className="text-white/50 text-sm mb-6">
                    Enter an invite code or public community slug
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="ABCD1234 or community-slug"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors uppercase font-mono tracking-wider"
                            disabled={loading || success}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-3 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-xl px-4 py-3 text-green-200 text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Successfully joined! Redirecting...
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading || success}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success || !code.trim()}
                            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {success ? 'Joined!' : 'Join'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
