'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateRolePermissions } from '@/actions/roles';
import { Loader2, Save, Check } from 'lucide-react';
import { Role, Permission } from '@/actions/roles';

interface RoleMatrixProps {
    roles: Role[];
    permissions: Permission[];
    initialMatrix: Record<string, string[]>; // roleId -> [permIds]
}

export default function RoleMatrix({ roles, permissions, initialMatrix }: RoleMatrixProps) {
    const router = useRouter();
    const [matrix, setMatrix] = useState(initialMatrix);
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const [changed, setChanged] = useState<Record<string, boolean>>({});

    // Group permissions by module
    const modules: Record<string, Permission[]> = {};
    permissions.forEach(p => {
        if (!modules[p.module]) modules[p.module] = [];
        modules[p.module].push(p);
    });

    const togglePermission = (roleId: string, permId: string) => {
        setMatrix(prev => {
            const current = prev[roleId] || [];
            if (current.includes(permId)) {
                return { ...prev, [roleId]: current.filter(id => id !== permId) };
            } else {
                return { ...prev, [roleId]: [...current, permId] };
            }
        });
        setChanged(prev => ({ ...prev, [roleId]: true }));
    };

    const handleSaveRole = async (roleId: string) => {
        setSaving(prev => ({ ...prev, [roleId]: true }));
        try {
            const res = await updateRolePermissions(roleId, matrix[roleId]);
            if (res.success) {
                setChanged(prev => ({ ...prev, [roleId]: false }));
                // Show brief success somehow or just rely on button state reset
            } else {
                alert('Failed to save permissions');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(prev => ({ ...prev, [roleId]: false }));
            router.refresh();
        }
    };

    return (
        <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-gray-50/50">
                        <th className="p-4 text-left font-medium text-gray-500 w-[200px]">Permission</th>
                        {roles.map(role => (
                            <th key={role.id} className="p-4 text-center font-medium min-w-[120px]">
                                <div className="flex flex-col items-center gap-2">
                                    <span>{role.name}</span>
                                    {changed[role.id] && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-6 text-xs"
                                            onClick={() => handleSaveRole(role.id)}
                                            disabled={saving[role.id]}
                                        >
                                            {saving[role.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                                        </Button>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {Object.entries(modules).map(([moduleName, perms]) => (
                        <>
                            <tr key={`${moduleName}-header`} className="bg-gray-50">
                                <td colSpan={roles.length + 1} className="px-4 py-2 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                                    {moduleName} Module
                                </td>
                            </tr>
                            {perms.map(perm => (
                                <tr key={perm.id} className="hover:bg-gray-50/50">
                                    <td className="p-4">
                                        <div className="font-medium">{perm.name}</div>
                                        <div className="text-xs text-muted-foreground">{perm.description}</div>
                                    </td>
                                    {roles.map(role => {
                                        const isChecked = matrix[role.id]?.includes(perm.id);
                                        return (
                                            <td key={`${role.id}-${perm.id}`} className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={isChecked || false}
                                                    onChange={() => togglePermission(role.id, perm.id)}
                                                    disabled={role.is_system && role.code === 'owner'} // Owner gets everything usually, but for now editable
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
