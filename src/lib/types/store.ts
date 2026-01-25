export interface StoreProduct {
    id: string;
    community_id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image_url?: string;
    active: boolean;
}

export interface StoreOrder {
    id: string;
    community_id: string;
    customer_id: string;
    items: Array<{ product_id: string; quantity: number; price: number }>;
    total_amount: number;
    status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
    delivery_address?: string;
    created_at: string;
}
