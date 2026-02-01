import { getTenantBySlug } from '@/actions/shared';
import { getRoles, getPermissions, getRolePermissionsForTenant } from '@/actions/roles';
import RoleMatrix from '@/components/settings/RoleMatrix';
import { ShieldAlert, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function RolesPage({ params }: { params: { slug: string } }) {
    const tenant = await getTenantBySlug(params.slug);
    if (!tenant) return <div>Tenant not found</div>;

    const [rolesRes, permsRes, matrixRes] = await Promise.all([
        getRoles(tenant.id),
        getPermissions(),
        getRolePermissionsForTenant(tenant.id)
    ]);

    const roles = rolesRes.data || [];
    const permissions = permsRes.data || [];
    const initialMatrix = matrixRes.matrix || {};

    if (permissions.length === 0) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>System Configuration Missing</AlertTitle>
                    <AlertDescription>
                        No permissions found in the database. Please run the seeding script (sql/11_seed_permissions.sql).
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground">Manage access control and security policies.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Users className="md:mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Manage Users</span>
                    </Button>
                    <Button>
                        <Plus className="md:mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Create Role</span>
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-1">
                <RoleMatrix
                    roles={roles}
                    permissions={permissions}
                    initialMatrix={initialMatrix}
                />
            </div>
        </div>
    );
}
