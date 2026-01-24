-- Cluster 2: Jobs & Resumes
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. JOBS & COMPANIES
-- ==========================================

DROP TABLE IF EXISTS job_alerts CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS job_posts CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES memberships(id), -- User who manages this company profile
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- Can be null if personal hire
    posted_by UUID NOT NULL REFERENCES memberships(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT DEFAULT 'Remote', -- or 'On-site', 'Hybrid'
    type TEXT DEFAULT 'Full-time', -- 'Contract', 'Part-time'
    salary_range TEXT, -- '50k-80k'
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'DRAFT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Resume',
    storage_path TEXT NOT NULL, -- Path in Supabase Storage bucket 'resumes'
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id),
    cover_letter TEXT,
    status TEXT DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    keywords TEXT, -- Simple search string
    frequency TEXT DEFAULT 'DAILY' CHECK (frequency IN ('DAILY', 'WEEKLY', 'INSTANT')),
    last_sent_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- Companies: Public read, Owner edit
CREATE POLICY "Public view companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Owners manage companies" ON companies FOR ALL USING (
    owner_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = companies.community_id AND role IN ('Owner', 'Admin'))
);

-- Jobs: Public read active, Poster edit
CREATE POLICY "Public view active jobs" ON job_posts FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Posters manage jobs" ON job_posts FOR ALL USING (
    posted_by IN (SELECT id FROM memberships WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid() AND tenant_id = job_posts.community_id AND role IN ('Owner', 'Admin'))
);

-- Resumes: User own only (unless public? keeping private for now)
CREATE POLICY "Users manage own resumes" ON resumes FOR ALL USING (
    user_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);

-- Applications: Applicant sees own, Job Poster sees received
CREATE POLICY "Applicant manage own" ON job_applications FOR ALL USING (
    applicant_id IN (SELECT id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Recruiter view applications" ON job_applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM job_posts WHERE id = job_applications.job_id AND posted_by IN (SELECT id FROM memberships WHERE user_id = auth.uid()))
);
