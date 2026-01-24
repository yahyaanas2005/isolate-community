export type ListingStatus = 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'DELETED';

export interface Listing {
    id: string;
    community_id: string;
    seller_id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    status: ListingStatus;
    created_at: string;
    updated_at: string;

    // Joins
    seller?: {
        full_name: string;
        avatar_url?: string;
    };
}

export interface MarketplaceMessage {
    id: string;
    listing_id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    created_at: string;
}
