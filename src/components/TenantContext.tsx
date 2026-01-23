'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface TenantContextType {
    tenant: Tenant | null;
    availableTenants: Tenant[];
    switchTenant: (slug: string) => void;
    loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserCommunities() {
            try {
                // 1. Get Current User
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setLoading(false);
                    return;
                }

                // 2. Fetch Memberships -> Tenants
                // We join memberships with tenants to get the community details
                const { data: memberships, error } = await supabase
                    .from('memberships')
                    .select('*, tenant:tenants(*)')
                    .eq('user_id', user.id); // Although RLS forces this, good to be explicit

                if (error) {
                    console.error('Error fetching communities:', error);
                } else if (memberships) {
                    // Extract tenants from memberships
                    // @ts-ignore
                    const myTenants = memberships.map(m => m.tenant).filter(Boolean) as Tenant[];
                    setAvailableTenants(myTenants);

                    // Do NOT auto-select a tenant. Allow "null" state for the Dashboard Grid.
                }
            } catch (e) {
                console.error('Unexpected error fetching communities:', e);
            } finally {
                setLoading(false);
            }
        }

        fetchUserCommunities();
    }, []);

    const switchTenant = (slug: string) => {
        const selected = availableTenants.find((t) => t.slug === slug);
        if (selected) {
            setTenant(selected);
        }
    };

    return (
        <TenantContext.Provider value={{ tenant, availableTenants, switchTenant, loading }}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-black text-white">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                        <p className="text-white/50 text-sm font-medium animate-pulse">Loading your world...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
