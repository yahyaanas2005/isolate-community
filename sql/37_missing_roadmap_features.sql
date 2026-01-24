-- Feature 37: Missing Roadmap Items (Reports, Panic Button, Car Pool, Credits)
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. HELP DESK REPORTS (VIEWS) 📊
-- ==========================================

-- Ensure dependencies exist (from 36_deep_helpdesk.sql)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tower TEXT; 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS unit_id TEXT;

-- Tower wise Report: Count tickets by Unit/Tower
CREATE OR REPLACE VIEW view_helpdesk_stats_by_tower AS
SELECT 
    community_id,
    tower,
    COUNT(*) as total_tickets,
    COUNT(*) FILTER (WHERE status = 'OPEN') as open_tickets,
    COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_tickets
FROM tickets
GROUP BY community_id, tower;

-- Category wise Report
CREATE OR REPLACE VIEW view_helpdesk_stats_by_category AS
SELECT 
    t.community_id,
    c.name as category_name,
    COUNT(*) as total_tickets,
    COUNT(*) FILTER (WHERE t.status = 'URGENT') as urgent_tickets
FROM tickets t
LEFT JOIN ticket_categories c ON t.category_id = c.id
GROUP BY t.community_id, c.name;

-- Average Closure Time Report
CREATE OR REPLACE VIEW view_helpdesk_closure_time AS
SELECT 
    community_id,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)::NUMERIC(10,2) as avg_resolution_hours
FROM tickets
WHERE status IN ('RESOLVED', 'CLOSED')
GROUP BY community_id;


-- ==========================================
-- 2. PANIC BUTTON 🚨
-- ==========================================

DROP TABLE IF EXISTS panic_alerts CASCADE;
DROP TYPE IF EXISTS panic_type CASCADE;
DROP TYPE IF EXISTS panic_status CASCADE;

CREATE TYPE panic_type AS ENUM ('MEDICAL', 'SECURITY', 'FIRE', 'OTHER');
CREATE TYPE panic_status AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_ALARM');

CREATE TABLE panic_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    type panic_type DEFAULT 'OTHER',
    status panic_status DEFAULT 'ACTIVE',
    location_coordinates TEXT, -- "Lat,Long"
    unit_number TEXT, -- Snapshot of where they might be
    alert_recipients JSONB, -- Array of contact info notified at the time
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES memberships(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE panic_alerts ENABLE ROW LEVEL SECURITY;

-- Everyone can create
CREATE POLICY "Members raise panic alerts" ON panic_alerts FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);

-- Admins/Guards see all
CREATE POLICY "Security views panic alerts" ON panic_alerts FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id AND role IN ('Owner', 'Admin', 'Staff'))
    OR
    EXISTS (SELECT 1 FROM security_guard_profiles WHERE user_id = auth.uid() AND community_id = panic_alerts.community_id)
);


-- ==========================================
-- 3. CAR POOLING 🚗
-- ==========================================

DROP TABLE IF EXISTS car_pool_rides CASCADE;
DROP TABLE IF EXISTS car_pool_requests CASCADE;

CREATE TABLE car_pool_rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    vehicle_info TEXT, -- "Red Toyota Camry"
    route_start TEXT NOT NULL,
    route_end TEXT NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    seats_available INTEGER DEFAULT 3,
    cost_per_seat NUMERIC(10, 2) DEFAULT 0, -- 0 for free
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'FULL', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE car_pool_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES car_pool_rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ride_id, passenger_id)
);

ALTER TABLE car_pool_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_pool_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active rides" ON car_pool_rides FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = community_id)
);
CREATE POLICY "Drivers manage rides" ON car_pool_rides FOR ALL USING (
    driver_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Passengers manage requests" ON car_pool_requests FOR ALL USING (
    passenger_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);


-- ==========================================
-- 4. CE/CREDITS TRACKING 🎓
-- ==========================================

DROP TABLE IF EXISTS credit_courses CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;

CREATE TABLE credit_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    provider TEXT,
    credits_value NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    category TEXT, -- "Legal", "Ethics"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    course_id UUID REFERENCES credit_courses(id),
    external_course_name TEXT, -- If not in our DB
    credits_earned NUMERIC(5, 2) NOT NULL,
    date_completed DATE NOT NULL,
    certificate_url TEXT,
    status TEXT DEFAULT 'VERIFIED' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE credit_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View courses" ON credit_courses FOR SELECT USING (true);
CREATE POLICY "Users view own credits" ON user_credits FOR SELECT USING (
    user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);


-- ==========================================
-- 5. DISCUSSION BOARDS (Members to Members) 💬
-- ==========================================

DROP TABLE IF EXISTS discussion_boards CASCADE;
DROP TABLE IF EXISTS discussion_threads CASCADE;
DROP TABLE IF EXISTS discussion_posts CASCADE;

CREATE TABLE discussion_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE, -- Staff only?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE discussion_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES discussion_boards(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE discussion_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_post_id UUID REFERENCES discussion_posts(id), -- For nesting
    is_accepted_answer BOOLEAN DEFAULT FALSE, -- For Q&A style
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE discussion_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View boards" ON discussion_boards FOR SELECT USING (true);
CREATE POLICY "View threads" ON discussion_threads FOR SELECT USING (
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = (SELECT community_id FROM discussion_boards WHERE id = board_id))
);
