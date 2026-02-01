'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    async function handlePasswordReset() {
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setSent(true);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800">
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                        <p className="text-gray-400 mb-6">
                            We've sent a password reset link to <strong className="text-white">{email}</strong>
                        </p>
                        <p className="text-sm text-gray-500 mb-8">
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md">
                <button
                    onClick={() => router.push('/login')}
                    className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </button>

                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                    <div className="mb-6 inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-full">
                        <Mail className="w-6 h-6 text-purple-500" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-3">Forgot Password?</h2>
                    <p className="text-gray-400 mb-6">
                        No worries! Enter your email and we'll send you a reset link.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePasswordReset()}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="you@example.com"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handlePasswordReset}
                            disabled={loading || !email}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
