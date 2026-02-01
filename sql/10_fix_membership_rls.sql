-- ============================================================================
-- FIX: Membership RLS for Tenant Creation (REVISION 2)
-- Issue: Users getting "policy violation" when creating a new community.
-- Error: "function is_admin(uuid) does not exist" -> We define it here to be safe.
-- ============================================================================

-- 1. Ensure the Helper Function Exists
CREATE OR REPLACE FUNCTION public.is_admin(t_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.tenant_id = t_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'Owner', 'Admin', 'chairman', 'Chairman')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop existing strict policies if any (Clean slate for INSERT)
DROP POLICY IF EXISTS "Users can create memberships" ON memberships;
DROP POLICY IF EXISTS "Authenticated create memberships" ON memberships;
DROP POLICY IF EXISTS "Start new community ownership" ON memberships;

-- 3. Create the "Self-Insert" Policy
-- This allows:
-- A) Creating a new Tenant: You become 'Owner' (First member)
-- B) Joining a Tenant: You become 'member' or 'pending'

CREATE POLICY "Users can create memberships" ON memberships
FOR INSERT TO authenticated
WITH CHECK (
    -- Rule 1: You can only insert for YOURSELF
    auth.uid() = user_id
    
    AND (
        -- Case A: Claiming Ownership (Must be the FIRST owner)
        (
            role IN ('Owner', 'owner')
            AND NOT EXISTS (
                SELECT 1 FROM memberships m
                WHERE m.tenant_id = memberships.tenant_id
                AND m.role IN ('Owner', 'owner')
            )
        )
        
        OR
        
        -- Case B: Standard Membership (Joining as non-admin)
        (
           role NOT IN ('Owner', 'owner', 'Admin', 'admin', 'Chairman', 'chairman')
        )
    )
);

-- 4. Ensure Admins can add others (Invite Flow)
DROP POLICY IF EXISTS "Admins insert memberships" ON memberships;

CREATE POLICY "Admins insert memberships" ON memberships
FOR INSERT TO authenticated
WITH CHECK (
    -- Check if the ACTOR (auth.uid) is an Admin of the target tenant
    public.is_admin(tenant_id)
);
