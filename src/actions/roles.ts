'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type Role = {
    id: string;
    tenant_id: string;
    code: string;
    name: string;
    description: string;
    is_system: boolean;
};

export type Permission = {
    id: string;
    code: string;
    module: string;
    name: string;
    description: string;
};

export async function getRoles(tenantId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name');

    return { data, error };
}

export async function createRole(tenantId: string, data: { name: string; description?: string }) {
    const supabase = await createClient();
    const code = data.name.toLowerCase().replace(/\s+/g, '_');

    const { data: role, error } = await supabase
        .from('roles')
        .insert({
            tenant_id: tenantId,
            name: data.name,
            code: code,
            description: data.description,
            is_system: false // User created roles are never system
        })
        .select()
        .single();

    if (error) return { error: error.message };
    revalidatePath(`/dashboard`);
    return { data: role };
}

export async function deleteRole(roleId: string) {
    const supabase = await createClient();

    // Check if system role first? (Actually RLS should handle this, or we check is_system)
    const { data: role } = await supabase.from('roles').select('is_system').eq('id', roleId).single();
    if (role?.is_system) return { error: 'Cannot delete system roles' };

    const { error } = await supabase.from('roles').delete().eq('id', roleId);
    if (error) return { error: error.message };

    revalidatePath(`/dashboard`);
    return { success: true };
}

export async function getPermissions() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module, code');
    return { data, error };
}

export async function getRolePermissions(roleId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId);

    return {
        permissionIds: data?.map(d => d.permission_id) || [],
        error
    };
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
    const supabase = await createClient();

    // 1. Delete existing
    const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

    if (deleteError) return { error: deleteError.message };

    // 2. Insert new
    if (permissionIds.length > 0) {
        const { error: insertError } = await supabase
            .from('role_permissions')
            .insert(permissionIds.map(pid => ({
                role_id: roleId,
                permission_id: pid
            })));

        if (insertError) return { error: insertError.message };
    }

    revalidatePath(`/dashboard`);
    return { success: true };
}

export async function getRolePermissionsForTenant(tenantId: string) {
    const supabase = await createClient();

    // Fetch all roles for this tenant first
    const { data: roles } = await supabase.from('roles').select('id, name').eq('tenant_id', tenantId);

    if (!roles || roles.length === 0) return { matrix: {}, roleMap: {}, error: null };

    const roleIds = roles.map(r => r.id);

    // Fetch all permissions for these roles
    const { data: perms } = await supabase
        .from('role_permissions')
        .select('role_id, permission_id')
        .in('role_id', roleIds);

    // Format as Map: { roleId: [permId, permId] }
    const matrix: Record<string, string[]> = {};
    const roleMap: Record<string, string> = {}; // id -> name

    roles.forEach(r => {
        roleMap[r.id] = r.name;
        matrix[r.id] = [];
    });

    perms?.forEach(p => {
        if (matrix[p.role_id]) matrix[p.role_id].push(p.permission_id);
    });

    return { matrix, roleMap, error: null };
}
