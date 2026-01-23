'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '@/lib/types';
import { supabase } from '@/lib/supabase';

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
        async function fetchTenants() {
            try {
                const { data, error } = await supabase.from('tenants').select('*');

                if (error) {
                    console.error('Error fetching tenants:', error);
                    // Fallback or empty state
                } else if (data) {
                    setAvailableTenants(data as Tenant[]);
                    if (data.length > 0) {
                        // Default to first tenant if none selected
                        setTenant(data[0] as Tenant);
                    }
                }
            } catch (e) {
                console.error('Unexpected error fetching tenants:', e);
            } finally {
                setLoading(false);
            }
        }

        fetchTenants();
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
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 text-sm">Loading communities...</p>
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
