-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================
-- Multi-tenant security for Isolate Community Platform
-- Run this after 05_mvp_schema.sql

-- =========================================
-- 1. ENABLE RLS ON ALL TABLES
-- =========================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 2. PROFILES POLICIES
-- =========================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can view profiles of members in their communities
DROP POLICY IF EXISTS "Users can view community member profiles" ON profiles;
CREATE POLICY "Users can view community member profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships m1
      WHERE m1.user_id = auth.uid()
      AND m1.tenant_id IN (
        SELECT m2.tenant_id FROM memberships m2
        WHERE m2.user_id = profiles.id
      )
    )
  );

-- =========================================
-- 3. TENANTS POLICIES
-- =========================================

-- Users can view public tenants
DROP POLICY IF EXISTS "Anyone can view public tenants" ON tenants;
CREATE POLICY "Anyone can view public tenants"
  ON tenants FOR SELECT
  USING (is_public = true);

-- Users can view tenants they are members of
DROP POLICY IF EXISTS "Users can view their tenants" ON tenants;
CREATE POLICY "Users can view their tenants"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = tenants.id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

-- Authenticated users can create tenants
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON tenants;
CREATE POLICY "Authenticated users can create tenants"
  ON tenants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Owners can update their tenants
DROP POLICY IF EXISTS "Owners can update tenants" ON tenants;
CREATE POLICY "Owners can update tenants"
  ON tenants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = tenants.id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('Owner', 'Admin')
      AND memberships.status = 'active'
    )
  );

-- Owners can delete their tenants
DROP POLICY IF EXISTS "Owners can delete tenants" ON tenants;
CREATE POLICY "Owners can delete tenants"
  ON tenants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = tenants.id
      AND memberships.user_id = auth.uid()
      AND memberships.role = 'Owner'
      AND memberships.status = 'active'
    )
  );

-- =========================================
-- 4. MEMBERSHIPS POLICIES
-- =========================================

-- Users can view their own memberships
DROP POLICY IF EXISTS "Users can view own memberships" ON memberships;
CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view memberships in their communities
DROP POLICY IF EXISTS "Users can view community memberships" ON memberships;
CREATE POLICY "Users can view community memberships"
  ON memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.tenant_id = memberships.tenant_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

-- Authenticated users can create memberships (for joining communities)
DROP POLICY IF EXISTS "Users can create memberships" ON memberships;
CREATE POLICY "Users can create memberships"
  ON memberships FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.tenant_id = memberships.tenant_id
      AND m.user_id = auth.uid()
      AND m.role IN ('Owner', 'Admin')
      AND m.status = 'active'
    )
  );

-- Owners and Admins can update memberships (role changes, status updates)
DROP POLICY IF EXISTS "Admins can update memberships" ON memberships;
CREATE POLICY "Admins can update memberships"
  ON memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.tenant_id = memberships.tenant_id
      AND m.user_id = auth.uid()
      AND m.role IN ('Owner', 'Admin')
      AND m.status = 'active'
    )
  );

-- Users can delete their own memberships (leave community)
DROP POLICY IF EXISTS "Users can leave communities" ON memberships;
CREATE POLICY "Users can leave communities"
  ON memberships FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.tenant_id = memberships.tenant_id
      AND m.user_id = auth.uid()
      AND m.role IN ('Owner', 'Admin')
      AND m.status = 'active'
    )
  );

-- =========================================
-- 5. GROUPS POLICIES
-- =========================================

-- Members can view public groups in their communities
DROP POLICY IF EXISTS "Members can view public groups" ON groups;
CREATE POLICY "Members can view public groups"
  ON groups FOR SELECT
  USING (
    is_private = false AND
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = groups.tenant_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

-- Members can view private groups they belong to
DROP POLICY IF EXISTS "Members can view their private groups" ON groups;
CREATE POLICY "Members can view their private groups"
  ON groups FOR SELECT
  USING (
    is_private = true AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- Community members can create groups
DROP POLICY IF EXISTS "Members can create groups" ON groups;
CREATE POLICY "Members can create groups"
  ON groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = groups.tenant_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

-- Group creators and community admins can update groups
DROP POLICY IF EXISTS "Admins can update groups" ON groups;
CREATE POLICY "Admins can update groups"
  ON groups FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = groups.tenant_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('Owner', 'Admin')
      AND memberships.status = 'active'
    )
  );

-- Group creators and community admins can delete groups
DROP POLICY IF EXISTS "Admins can delete groups" ON groups;
CREATE POLICY "Admins can delete groups"
  ON groups FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = groups.tenant_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('Owner', 'Admin')
      AND memberships.status = 'active'
    )
  );

-- =========================================
-- 6. GROUP MEMBERS POLICIES
-- =========================================

-- Members can view group membership
DROP POLICY IF EXISTS "Members can view group members" ON group_members;
CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      JOIN memberships m ON m.tenant_id = g.tenant_id
      WHERE g.id = group_members.group_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

-- Users can join public groups
DROP POLICY IF EXISTS "Users can join public groups" ON group_members;
CREATE POLICY "Users can join public groups"
  ON group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM groups g
      JOIN memberships m ON m.tenant_id = g.tenant_id
      WHERE g.id = group_members.group_id
      AND g.is_private = false
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

-- Group admins can add/remove members
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;
CREATE POLICY "Group admins can manage members"
  ON group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- Users can leave groups
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;
CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING (user_id = auth.uid());

-- =========================================
-- 7. POSTS POLICIES
-- =========================================

-- Community members can view posts
DROP POLICY IF EXISTS "Members can view posts" ON posts;
CREATE POLICY "Members can view posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = posts.tenant_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
    AND (
      -- Post is not in a group OR user is in that group
      posts.group_id IS NULL OR
      EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = posts.group_id
        AND group_members.user_id = auth.uid()
      )
    )
  );

-- Community members can create posts
DROP POLICY IF EXISTS "Members can create posts" ON posts;
CREATE POLICY "Members can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = posts.tenant_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

-- Authors can update their own posts
DROP POLICY IF EXISTS "Authors can update own posts" ON posts;
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (author_id = auth.uid());

-- Authors and admins can delete posts
DROP POLICY IF EXISTS "Authors and admins can delete posts" ON posts;
CREATE POLICY "Authors and admins can delete posts"
  ON posts FOR DELETE
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = posts.tenant_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('Owner', 'Admin', 'Sub-Admin')
      AND memberships.status = 'active'
    )
  );

-- =========================================
-- 8. COMMENTS POLICIES
-- =========================================

-- Users can view comments on posts they can see
DROP POLICY IF EXISTS "Users can view comments" ON comments;
CREATE POLICY "Users can view comments"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN memberships m ON m.tenant_id = p.tenant_id
      WHERE p.id = comments.post_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

-- Users can create comments on posts they can see
DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts p
      JOIN memberships m ON m.tenant_id = p.tenant_id
      WHERE p.id = comments.post_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

-- Authors can update their own comments
DROP POLICY IF EXISTS "Authors can update own comments" ON comments;
CREATE POLICY "Authors can update own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid());

-- Authors and post owners can delete comments
DROP POLICY IF EXISTS "Authors can delete own comments" ON comments;
CREATE POLICY "Authors can delete own comments"
  ON comments FOR DELETE
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = comments.post_id
      AND p.author_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM posts p
      JOIN memberships m ON m.tenant_id = p.tenant_id
      WHERE p.id = comments.post_id
      AND m.user_id = auth.uid()
      AND m.role IN ('Owner', 'Admin', 'Sub-Admin')
      AND m.status = 'active'
    )
  );

-- =========================================
-- 9. REACTIONS POLICIES
-- =========================================

-- Users can view reactions
DROP POLICY IF EXISTS "Users can view reactions" ON reactions;
CREATE POLICY "Users can view reactions"
  ON reactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can add reactions
DROP POLICY IF EXISTS "Users can add reactions" ON reactions;
CREATE POLICY "Users can add reactions"
  ON reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can remove their own reactions
DROP POLICY IF EXISTS "Users can remove own reactions" ON reactions;
CREATE POLICY "Users can remove own reactions"
  ON reactions FOR DELETE
  USING (user_id = auth.uid());

-- =========================================
-- RLS POLICIES COMPLETE
-- =========================================
