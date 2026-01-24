-- Cluster 1: Marketplace & Chat
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. MARKETPLACE
-- ==========================================

DROP TABLE IF EXISTS marketplace_offers CASCADE;
DROP TABLE IF EXISTS marketplace_images CASCADE;
DROP TABLE IF EXISTS marketplace_listings CASCADE;

CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    condition TEXT CHECK (condition IN ('NEW', 'LIKE_NEW', 'USED', 'DAMAGED')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SOLD', 'HIDDEN', 'DELETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE marketplace_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE marketplace_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    offer_price NUMERIC(10, 2) NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. IN-APP CHAT
-- ==========================================

DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;

CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'DIRECT' CHECK (type IN ('DIRECT', 'GROUP', 'LISTING_INQUIRY')),
    related_listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_participants (
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES memberships(id) ON DELETE SET NULL, -- Keep message if user leaves?
    content TEXT,
    is_system_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_by JSONB DEFAULT '[]'::jsonb -- Array of user_ids who read it
);

-- ==========================================
-- 3. RLS POLICIES
-- ==========================================

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Listings: Viewable by all active members of community
CREATE POLICY "View active listings" ON marketplace_listings FOR SELECT USING (
    status = 'ACTIVE' AND 
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = marketplace_listings.community_id AND status = 'active')
);
CREATE POLICY "Manage own listings" ON marketplace_listings FOR ALL USING (
    seller_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = marketplace_listings.community_id AND role IN ('Owner', 'Admin'))
);

-- Offers: Buyer sees theirs, Seller sees theirs
CREATE POLICY "Buyer/Seller view offers" ON marketplace_offers FOR ALL USING (
    buyer_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()) OR
    listing_id IN (SELECT id FROM marketplace_listings WHERE seller_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()))
);

-- Chat: Only participants can view/send
CREATE POLICY "Participants view conversations" ON chat_conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_participants WHERE conversation_id = chat_conversations.id AND user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()))
);

CREATE POLICY "Participants view messages" ON chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_participants WHERE conversation_id = chat_messages.conversation_id AND user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()))
);

CREATE POLICY "Participants send messages" ON chat_messages FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()) AND
    EXISTS (SELECT 1 FROM chat_participants WHERE conversation_id = chat_messages.conversation_id AND user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()))
);
