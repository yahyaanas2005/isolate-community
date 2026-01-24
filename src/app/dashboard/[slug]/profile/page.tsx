'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User, Mail, Shield, Building } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();
    }, [supabase]);

    if (loading) return <div className="p-8">Loading profile...</div>;
    if (!user) return <div className="p-8">Please log in.</div>;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="px-8 pb-8 relative">
                    <div className="-mt-12 mb-6">
                        <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md inline-block">
                            <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email Address</label>
                            <div className="mt-1 flex items-center gap-2 text-lg font-medium text-gray-900">
                                <Mail className="w-5 h-5 text-gray-400" />
                                {user.email}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">User ID</label>
                            <div className="mt-1 flex items-center gap-2 font-mono text-sm text-gray-600 bg-gray-50 p-2 rounded w-fit">
                                <Shield className="w-4 h-4 text-gray-400" />
                                {user.id}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
