'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleAuth() {
        setLoading(true);
        try {
            // Try to sign in first
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                // If sign in fails, try to sign up
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (signUpError) throw signUpError;

                // After signup, sign in
                const { error: autoSignInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (autoSignInError) throw autoSignInError;
            }

            // Check if user has communities
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data: memberships } = await supabase
                .from('memberships')
                .select('tenant_id, tenants(slug)')
                .eq('user_id', user.id);

            if (memberships && memberships.length > 0) {
                // Redirect to first community
                const firstCommunity = memberships[0].tenants as any;
                router.push(`/dashboard/${firstCommunity.slug}`);
            } else {
                // No communities, go to onboarding
                router.push('/onboarding');
            }
        } catch (e) {
            alert('Error: ' + (e as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-between text-white">
                <div>
                    <h1 className="text-4xl font-bold mb-4">Welcome to Isolate.</h1>
                    <p className="text-xl text-blue-100">
                        Your passport to the world's diverse communities. Join today to unlock access to physical spaces, professional networks, and virtual worlds.
                    </p>
                </div>
                <p className="text-sm text-blue-200">© 2026 Isolate Platform</p>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
                        >
                            ← Back to Home
                        </button>
                        <h2 className="text-3xl font-bold text-white mb-2">Sign in or Join</h2>
                        <p className="text-gray-400">Enter your email to continue.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleAuth}
                            disabled={loading || !email || !password}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Processing...' : 'Sign In / Sign Up'}
                        </button>

                        <p className="text-center text-sm text-gray-400 mt-4">
                            If account exists, we'll log you in.<br />
                            If not, user will be created automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
