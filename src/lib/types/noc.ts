export interface NOCRequest {
    id: string;
    community_id: string;
    requester_id: string;
    type: 'RENOVATION' | 'CONSTRUCTION' | 'ALTERATION' | 'OTHER';
    title: string;
    description: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
    documents: string[];
    approved_by?: string;
    approved_at?: string;
    valid_until?: string;
    created_at: string;
}
