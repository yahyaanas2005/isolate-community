-- Feature 11: Billing & Accounting (MVP)
-- Feature 18: Payments Integration (Stripe)
-- Run this in Supabase SQL Editor

-- Clean up previous runs
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS member_charges CASCADE;
DROP TABLE IF EXISTS billing_plans CASCADE;
DROP TABLE IF EXISTS ledger_accounts CASCADE;

DROP TYPE IF EXISTS billing_cycle_type CASCADE;
DROP TYPE IF EXISTS ledger_account_type CASCADE;
DROP TYPE IF EXISTS journal_entry_type CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS charge_type CASCADE;

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE charge_type AS ENUM ('RECURRING', 'ONE_TIME');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'VOID');
CREATE TYPE payment_method_type AS ENUM ('ONLINE', 'CASH', 'BANK_TRANSFER', 'ADJUSTMENT', 'CHECK');
CREATE TYPE journal_entry_type AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE ledger_account_type AS ENUM ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY');
CREATE TYPE billing_cycle_type AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- ============================================
-- TABLES
-- ============================================

-- Ledger Accounts (Chart of Accounts)
CREATE TABLE ledger_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type ledger_account_type NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, code)
);

-- Billing Plans (e.g. "Gold Membership", "Parking Fee")
CREATE TABLE billing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    charge_type charge_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_cycle billing_cycle_type, -- Null if ONE_TIME
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Recurring Charges (Subscriptions)
CREATE TABLE member_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE, -- Link to membership
    billing_plan_id UUID REFERENCES billing_plans(id),
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    next_due_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Feature 18: Stripe Subscription
    stripe_subscription_id TEXT, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    invoice_number SERIAL, -- scoped per community ideally, but global serial for simple MVP
    status invoice_status DEFAULT 'DRAFT',
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    
    -- Feature 18: Stripe Payment Intent
    stripe_payment_intent_id TEXT,
    stripe_payment_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    method payment_method_type NOT NULL,
    reference TEXT, -- Transaction ID, Check #
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Feature 18
    stripe_payment_intent_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Entries (Double Entry Bookkeeping)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES ledger_accounts(id),
    entry_type journal_entry_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    reference_type TEXT, -- 'INVOICE', 'PAYMENT'
    reference_id UUID,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Helper policy to check for billing admin access
-- Owner, Admin, Staff have access
CREATE OR REPLACE FUNCTION can_manage_billing(p_community_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships
        WHERE user_id = auth.uid()
          AND tenant_id = p_community_id
          AND role IN ('Owner', 'Admin', 'Staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Billing Plans & Ledger: Read-only for members (maybe), Write for Admins
CREATE POLICY "Billing admins manage plans" ON billing_plans
FOR ALL USING (can_manage_billing(community_id));

CREATE POLICY "Members view active plans" ON billing_plans
FOR SELECT USING (is_active = true);

-- Invoices: Admins manage all, Members view own
CREATE POLICY "Billing admins manage invoices" ON invoices
FOR ALL USING (can_manage_billing(community_id));

CREATE POLICY "Members view own invoices" ON invoices
FOR SELECT USING (
    member_id IN (
        SELECT id FROM memberships WHERE user_id = auth.uid()
    )
);

-- Invoice Items: Inherit from Invoices
CREATE POLICY "Billing admins manage invoice items" ON invoice_items
FOR ALL USING (
    EXISTS (SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND can_manage_billing(community_id))
);

CREATE POLICY "Members view own invoice items" ON invoice_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM invoices i
        JOIN memberships m ON i.member_id = m.id
        WHERE i.id = invoice_items.invoice_id AND m.user_id = auth.uid()
    )
);

-- Payments: Admins manage all, Members view own
CREATE POLICY "Billing admins manage payments" ON payments
FOR ALL USING (can_manage_billing(community_id));

CREATE POLICY "Members view own payments" ON payments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM invoices i
        JOIN memberships m ON i.member_id = m.id
        WHERE i.id = payments.invoice_id AND m.user_id = auth.uid()
    )
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update invoice status on full payment
CREATE OR REPLACE FUNCTION update_invoice_status_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total NUMERIC;
    v_paid NUMERIC;
BEGIN
    SELECT total_amount, paid_amount INTO v_total, v_paid
    FROM invoices WHERE id = NEW.invoice_id;
    
    -- Update paid amount
    UPDATE invoices 
    SET paid_amount = paid_amount + NEW.amount 
    WHERE id = NEW.invoice_id;
    
    -- Check if fully paid
    IF (v_paid + NEW.amount) >= v_total THEN
        UPDATE invoices SET status = 'PAID' WHERE id = NEW.invoice_id;
        
        -- Create Notification (Feature 16)
        -- We need a way to get user_id from invoice.member_id -> memberships.user_id
        -- ... Skipping complex notification trigger here for brevity, but this is where it goes.
    ELSE
        UPDATE invoices SET status = 'PARTIALLY_PAID' WHERE id = NEW.invoice_id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_invoice_paid
AFTER INSERT ON payments
FOR EACH ROW
WHEN (NEW.invoice_id IS NOT NULL)
EXECUTE FUNCTION update_invoice_status_on_payment();
