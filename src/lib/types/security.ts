export type VisitorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT';

export interface Visitor {
    id: string;
    community_id: string;
    name: string;
    phone?: string;
    purpose: string;
    host_id: string;
    vehicle_number?: string;
    photo_url?: string;
    status: VisitorStatus;
    check_in_time?: string;
    check_out_time?: string;
    approved_by?: string;
    created_at: string;
}

export interface PreApproval {
    id: string;
    community_id: string;
    created_by: string;
    visitor_name: string;
    visitor_phone: string;
    valid_from: string;
    valid_until: string;
    purpose: string;
    otp_code?: string;
    is_used: boolean;
    created_at: string;
}

export interface GatePass {
    id: string;
    community_id: string;
    user_id: string;
    type: 'MATERIAL_IN' | 'MATERIAL_OUT';
    items: string;
    carrier_name?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    approved_by?: string;
    created_at: string;
}
