export interface Event {
    id: string;
    community_id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    capacity?: number;
    ticket_price?: number;
    image_url?: string;
    created_by: string;
    created_at: string;
}

export interface EventRSVP {
    id: string;
    event_id: string;
    user_id: string;
    status: 'GOING' | 'MAYBE' | 'NOT_GOING';
    guests_count: number;
    created_at: string;
}
