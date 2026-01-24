-- Cluster 8: Accounting-grade Finance
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. GENERAL LEDGER (Double Entry)
-- ==========================================

DROP TABLE IF EXISTS journal_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS ledger_accounts CASCADE;

CREATE TABLE ledger_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g. "1000", "4000"
    name TEXT NOT NULL, -- "Cash", "HOA Dues Revenue"
    type TEXT NOT NULL CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    is_system_account BOOLEAN DEFAULT FALSE, -- Prevent deletion of core accounts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, code)
);

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reference_number TEXT, -- Auto-generated or custom
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    memo TEXT,
    status TEXT DEFAULT 'POSTED' CHECK (status IN ('DRAFT', 'POSTED', 'VOID')),
    created_by UUID REFERENCES memberships(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
    description TEXT,
    debit NUMERIC(14, 2) DEFAULT 0,
    credit NUMERIC(14, 2) DEFAULT 0,
    -- Simple validation check
    CHECK (debit >= 0 AND credit >= 0)
    -- Note: Ensure sum(debit) == sum(credit) at app level or via trigger
);

-- ==========================================
-- 2. PROCUREMENT (Vendors & POs)
-- ==========================================

DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tax_id TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    requested_by UUID REFERENCES memberships(id),
    description TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED')),
    approved_by UUID REFERENCES memberships(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. RLS POLICIES
-- ==========================================

ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- FINANCE ROLES (Owner, Admin only for MVP. Later add 'Treasurer' role)
-- Strict access: Regular members should NOT see GL details.

-- Accounts: 
CREATE POLICY "Admins manage accounts" ON ledger_accounts FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = ledger_accounts.community_id AND role IN ('Owner', 'Admin'))
);

-- Journals:
CREATE POLICY "Admins manage journals" ON journal_entries FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = journal_entries.community_id AND role IN ('Owner', 'Admin'))
);

-- Lines:
CREATE POLICY "Admins manage lines" ON journal_lines FOR ALL USING (
    EXISTS (SELECT 1 FROM journal_entries WHERE id = journal_lines.entry_id AND 
        EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = journal_entries.community_id AND role IN ('Owner', 'Admin')))
);

-- Vendors: Admins manage
CREATE POLICY "Admins manage vendors" ON vendors FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = vendors.community_id AND role IN ('Owner', 'Admin'))
);

-- POs: Staff/Admins can request, Admins approve
CREATE POLICY "Staff view/create POs" ON purchase_orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = purchase_orders.community_id AND role IN ('Owner', 'Admin', 'Staff'))
);
CREATE POLICY "Staff insert POs" ON purchase_orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = purchase_orders.community_id AND role IN ('Owner', 'Admin', 'Staff'))
);
CREATE POLICY "Admins update POs" ON purchase_orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = purchase_orders.community_id AND role IN ('Owner', 'Admin'))
);
