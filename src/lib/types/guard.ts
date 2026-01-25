export interface PatrolRoute {
    id: string;
    community_id: string;
    name: string;
    checkpoints: string[];
    frequency: 'HOURLY' | 'DAILY' | 'WEEKLY';
    active: boolean;
}

export interface PatrolLog {
    id: string;
    route_id: string;
    guard_id: string;
    started_at: string;
    completed_at?: string;
    checkpoints_visited: string[];
    notes?: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
}

export interface Incident {
    id: string;
    community_id: string;
    reported_by: string;
    type: 'SUSPICIOUS_ACTIVITY' | 'NOISE' | 'DAMAGE' | 'OTHER';
    description: string;
    location: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    created_at: string;
}
