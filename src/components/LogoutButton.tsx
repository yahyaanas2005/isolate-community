'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh(); // Clear client cache
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    );
}
