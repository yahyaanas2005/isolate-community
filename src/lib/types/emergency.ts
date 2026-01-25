export interface EmergencyContact {
    id: string;
    community_id: string;
    name: string;
    role: string;
    phone: string;
    email?: string;
    priority: number;
}

export interface EmergencyPlan {
    id: string;
    community_id: string;
    type: 'FIRE' | 'EARTHQUAKE' | 'FLOOD' | 'MEDICAL' | 'SECURITY';
    title: string;
    procedures: string;
    evacuation_points?: string[];
    updated_at: string;
}

export interface PanicAlert {
    id: string;
    community_id: string;
    triggered_by: string;
    location?: string;
    status: 'ACTIVE' | 'RESOLVED';
    created_at: string;
    resolved_at?: string;
}
