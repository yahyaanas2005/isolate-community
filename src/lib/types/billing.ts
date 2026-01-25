export interface Invoice {
    id: string;
    community_id: string;
    member_id: string;
    invoice_number: string;
    amount: number;
    due_date: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    line_items: Array<{
        description: string;
        amount: number;
    }>;
    created_at: string;
}

export interface Payment {
    id: string;
    invoice_id: string;
    amount: number;
    payment_method: string;
    transaction_id?: string;
    paid_at: string;
}
