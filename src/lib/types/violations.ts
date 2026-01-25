export interface Violation {
    id: string;
    community_id: string;
    reported_by: string;
    violator_id: string;
    type: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'REPORTED' | 'UNDER_REVIEW' | 'CONFIRMED' | 'RESOLVED' | 'DISMISSED';
    fine_amount?: number;
    evidence_urls?: string[];
    created_at: string;
}

export interface Fine {
    id: string;
    violation_id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'WAIVED';
    due_date: string;
    paid_at?: string;
}
