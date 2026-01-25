export interface AccountingSummary {
    total_income: number;
    total_expenses: number;
    net_balance: number;
    period: string;
}

export interface GLEntry {
    id: string;
    community_id: string;
    account_code: string;
    account_name: string;
    debit: number;
    credit: number;
    description: string;
    transaction_date: string;
}

export interface Budget {
    id: string;
    community_id: string;
    category: string;
    allocated_amount: number;
    spent_amount: number;
    period: string;
}

export interface PurchaseOrder {
    id: string;
    community_id: string;
    vendor_name: string;
    items: Array<{ description: string; quantity: number; price: number }>;
    total_amount: number;
    status: 'DRAFT' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
    created_at: string;
}
