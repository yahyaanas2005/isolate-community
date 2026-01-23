'use client';

import { LogOut } from 'lucide-react';
import { signOut } from '@/app/login/actions';

export function LogoutButton() {
    return (
        <form action={signOut}>
            <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
                <LogOut className="w-4 h-4" />
                Sign Out
            </button>
        </form>
    );
}
