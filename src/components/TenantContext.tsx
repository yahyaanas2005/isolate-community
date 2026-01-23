'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '@/lib/types';

// Mock Tenants matching the SQL Seed Data
const MOCK_TENANTS: Tenant[] = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Sunnyvale Heights',
        slug: 'sunnyvale-heights',
        type: 'Physical',
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Cardiology Association',
        slug: 'cardio-assoc',
        type: 'Professional',
    },
    {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Global Gamers',
        slug: 'global-gamers',
        type: 'Virtual',
    },
];

interface TenantContextType {
    tenant: Tenant | null;
    availableTenants: Tenant[];
    switchTenant: (slug: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [tenant, setTenant] = useState<Tenant | null>(MOCK_TENANTS[0]);

    const switchTenant = (slug: string) => {
        const selected = MOCK_TENANTS.find((t) => t.slug === slug);
        if (selected) {
            setTenant(selected);
        }
    };

    return (
        <TenantContext.Provider value={{ tenant, availableTenants: MOCK_TENANTS, switchTenant }}>
            {children}
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
