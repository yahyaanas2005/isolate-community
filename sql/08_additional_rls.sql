-- =========================================
-- RLS POLICIES FOR ADDITIONAL MODULES
-- =========================================
-- Run this after 07_additional_modules.sql

-- =========================================
-- 1. SERVICE DESK RLS POLICIES
-- =========================================

-- Enable RLS on service tables
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_request_activity ENABLE ROW LEVEL SECURITY;

-- Service Categories: Readable by all community members
CREATE POLICY "Community members can view service categories"
  ON service_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = service_categories.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

-- Service Categories: Only admins can manage
CREATE POLICY "Admins can manage service categories"
  ON service_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = service_categories.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('Owner', 'Admin')
        AND memberships.status = 'active'
    )
  );

-- Service Requests: Members can view all requests in their community
CREATE POLICY "Community members can view service requests"
  ON service_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = service_requests.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

-- Service Requests: Any active member can create
CREATE POLICY "Community members can create service requests"
  ON service_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = service_requests.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
    AND created_by = auth.uid()
  );

-- Service Requests: Creator and staff/admins can update
CREATE POLICY "Authorized users can update service requests"
  ON service_requests FOR UPDATE
  USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = service_requests.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('Owner', 'Admin', 'Sub-Admin', 'Staff')
        AND memberships.status = 'active'
    )
  );

-- Service Request Activity: Readable by request viewers
CREATE POLICY "Users can view service request activity"
  ON service_request_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      JOIN memberships m ON m.tenant_id = sr.tenant_id
      WHERE sr.id = service_request_activity.request_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

-- Service Request Activity: Anyone who can update request can log activity
CREATE POLICY "Authorized users can log activity"
  ON service_request_activity FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

-- =========================================
-- 2. MARKETPLACE RLS POLICIES
-- =========================================

-- Enable RLS on marketplace tables
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_offers ENABLE ROW LEVEL SECURITY;

-- Marketplace Listings: All community members can view active listings
CREATE POLICY "Community members can view active marketplace listings"
  ON marketplace_listings FOR SELECT
  USING (
    status = 'ACTIVE' AND
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = marketplace_listings.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
    OR seller_id = auth.uid() -- Sellers can see their own listings regardless of status
  );

-- Marketplace Listings: Active members can create
CREATE POLICY "Community members can create marketplace listings"
  ON marketplace_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = marketplace_listings.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
    AND seller_id = auth.uid()
  );

-- Marketplace Listings: Sellers can update their own, admins can hide any
CREATE POLICY "Authorized users can update marketplace listings"
  ON marketplace_listings FOR UPDATE
  USING (
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = marketplace_listings.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('Owner', 'Admin', 'Sub-Admin')
        AND memberships.status = 'active'
    )
  );

-- Marketplace Listings: Sellers can delete their own
CREATE POLICY "Sellers can delete their own listings"
  ON marketplace_listings FOR DELETE
  USING (seller_id = auth.uid());

-- Marketplace Offers: Buyer and seller can view
CREATE POLICY "Buyers and sellers can view offers"
  ON marketplace_offers FOR SELECT
  USING (
    buyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE marketplace_listings.id = marketplace_offers.listing_id
        AND marketplace_listings.seller_id = auth.uid()
    )
  );

-- Marketplace Offers: Community members can create offers
CREATE POLICY "Community members can create offers"
  ON marketplace_offers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_listings ml
      JOIN memberships m ON m.tenant_id = ml.tenant_id
      WHERE ml.id = marketplace_offers.listing_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
    AND buyer_id = auth.uid()
  );

-- Marketplace Offers: Buyer can withdraw, seller can accept/reject
CREATE POLICY "Authorized users can update offers"
  ON marketplace_offers FOR UPDATE
  USING (
    buyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE marketplace_listings.id = marketplace_offers.listing_id
        AND marketplace_listings.seller_id = auth.uid()
    )
  );

-- =========================================
-- 3. JOB BOARD RLS POLICIES
-- =========================================

-- Enable RLS on job board tables
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Job Posts: All community members can view open jobs
CREATE POLICY "Community members can view job posts"
  ON job_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = job_posts.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

-- Job Posts: Active members can create job posts
CREATE POLICY "Community members can create job posts"
  ON job_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = job_posts.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
    AND posted_by = auth.uid()
  );

-- Job Posts: Poster can update their own jobs
CREATE POLICY "Job posters can update their own posts"
  ON job_posts FOR UPDATE
  USING (posted_by = auth.uid());

-- Job Posts: Poster can delete their own jobs
CREATE POLICY "Job posters can delete their own posts"
  ON job_posts FOR DELETE
  USING (posted_by = auth.uid());

-- Job Applications: Applicant and job poster can view
CREATE POLICY "Applicants and posters can view applications"
  ON job_applications FOR SELECT
  USING (
    applicant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM job_posts
      WHERE job_posts.id = job_applications.job_id
        AND job_posts.posted_by = auth.uid()
    )
  );

-- Job Applications: Community members can apply
CREATE POLICY "Community members can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts jp
      JOIN memberships m ON m.tenant_id = jp.tenant_id
      WHERE jp.id = job_applications.job_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
    AND applicant_id = auth.uid()
  );

-- Job Applications: Applicant can update (withdraw), poster can update status
CREATE POLICY "Authorized users can update applications"
  ON job_applications FOR UPDATE
  USING (
    applicant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM job_posts
      WHERE job_posts.id = job_applications.job_id
        AND job_posts.posted_by = auth.uid()
    )
  );

-- =========================================
-- RLS POLICIES COMPLETE
-- =========================================
