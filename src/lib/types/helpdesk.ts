export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketCategory {
    id: string;
    name: string;
    description?: string;
}

export interface Ticket {
    id: string;
    community_id: string;
    category_id: string;
    created_by: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    assigned_to?: string;
    unit_id?: string;
    tower?: string;
    created_at: string;
    updated_at: string;

    // Joins
    category?: TicketCategory;
    creator?: {
        full_name: string;
        avatar_url: string;
    };
}

export interface TicketRating {
    id: string;
    ticket_id: string;
    rating: number;
    comment?: string;
    created_at: string;
}
