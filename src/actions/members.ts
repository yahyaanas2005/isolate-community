'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type MemberStatus = 'pending' | 'active' | 'suspended' | 'expired' | 'terminated' | 'blacklisted';

export async function getMembers(
    tenantId: string,
    search?: string,
    role?: string,
    status?: string,
    page: number = 1
) {
    const supabase = await createClient();
    const PAGE_SIZE = 10;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from('memberships')
        .select(`
      id,
      role,
      status,
      created_at,
      user:profiles!user_id (
        id,
        full_name,
        email,
        avatar_url,
        phone
      ),
      type:membership_types (
        name
      )
    `, { count: 'exact' })
        .eq('tenant_id', tenantId);

    if (role) {
        query = query.eq('role', role);
    }

    if (status) {
        query = query.eq('status', status);
    }

    // Determine filtering approach based on search term
    if (search) {
        // NOTE: Supabase doesn't support easy joining filter on relation fields in standard select without simpler flattening.
        // For typical usage, we search profile fields. Since profile is a relation, we filter on the joined column.
        // However, standard Supabase .or() with foreign tables syntax is tricky: 'user.full_name.ilike.%search%'
        // We will try the standard notation for foreign table filtering.
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`, { foreignTable: 'profiles' });
    }

    const { data, count, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching members:', error);
        return { data: [], count: 0, error };
    }

    return { data, count, error: null };
}

export async function updateMembershipStatus(
    membershipId: string,
    status: MemberStatus,
    path: string
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('memberships')
        .update({ status })
        .eq('id', membershipId);

    if (error) {
        console.error('Error updating membership status:', error);
        return { success: false, error };
    }

    revalidatePath(path);
    return { success: true };
}

export async function inviteMember(
    tenantId: string,
    email: string,
    role: string,
    typeId?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUser) {
        // Check if already a member
        const { data: existingMembership } = await supabase
            .from('memberships')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('user_id', existingUser.id)
            .single();

        if (existingMembership) {
            return { success: false, error: 'User is already a member of this community.' };
        }

        // Direct add (Phase 1 simplification) - Ideally should be an invite they accept
        // For now, let's create the membership immediately if they exist
        const { error } = await supabase.from('memberships').insert({
            tenant_id: tenantId,
            user_id: existingUser.id,
            role,
            membership_type_id: typeId,
            status: 'active' // Auto-active for now if direct add
        });

        if (error) return { success: false, error: error.message };

    } else {
        // User doesn't exist - create invitation record
        // We need to implement the invitation token flow later.
        // For MVP Phase 1: We return a message saying only existing platform users can be added for now 
        // OR we insert into member_invitations if schema is ready.

        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const { error } = await supabase.from('member_invitations').insert({
            tenant_id: tenantId,
            email,
            role_id: null, // We are using string role enum in basic memberships still, pending update to 'roles' table usage fully
            // NOTE: The new schema uses 'roles' table but current 'memberships' uses 'role' text enum column based on previous code.
            // We need to support the transitional state. The schema update adds 'roles' table but might not strictly enforce FK on memberships if we didn't migrate old column.
            // Let's assume we are inserting into 'member_invitations'.
            invited_by: user.id,
            token,
            expires_at: expiresAt
        });

        if (error) {
            // If table doesn't exist yet (migration not run), this fails.
            // Fallback: Return error
            return { success: false, error: 'User not found on platform. Invitation system coming soon.' };
        }

        return { success: true, message: 'Invitation sent (simulated for now)' };
    }

    revalidatePath(`/dashboard`);
    return { success: true };
}

export async function getMembershipTypes(tenantId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order');

    return { data, error };
}
