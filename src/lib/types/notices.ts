export interface Notice {
    id: string;
    community_id: string;
    title: string;
    content: string;
    category: 'ANNOUNCEMENT' | 'ALERT' | 'EVENT' | 'MAINTENANCE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    target_audience: 'ALL' | 'OWNERS' | 'TENANTS' | 'SPECIFIC';
    created_by: string;
    created_at: string;
    expires_at?: string;
}
