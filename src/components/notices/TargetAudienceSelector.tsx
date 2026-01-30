'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Building,
    Check,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TargetAudienceSelectorProps {
    onChange: (rules: any) => void;
}

export function TargetAudienceSelector({ onChange }: TargetAudienceSelectorProps) {
    const [mode, setMode] = useState<'everyone' | 'targeted'>('everyone');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    // Available roles (In a real app, fetch from API)
    const ROLES = [
        { id: 'admin', label: 'Admins', icon: Shield },
        { id: 'staff', label: 'Staff', icon: Building },
        { id: 'resident', label: 'Residents', icon: Users },
        { id: 'owner', label: 'Owners', icon: Users } // Distinct from Resident-tenant
    ];

    const toggleRole = (roleId: string) => {
        setSelectedRoles(prev => {
            const newRoles = prev.includes(roleId)
                ? prev.filter(r => r !== roleId)
                : [...prev, roleId];
            return newRoles;
        });
    };

    useEffect(() => {
        if (mode === 'everyone') {
            onChange(null);
        } else {
            onChange({
                include: {
                    roles: selectedRoles
                }
            });
        }
    }, [mode, selectedRoles, onChange]);

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
            <label className="text-sm font-medium text-gray-700 block mb-2">Target Audience</label>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setMode('everyone')}
                    className={cn(
                        "flex-1 py-2 px-3 text-sm font-medium rounded-md border transition-all",
                        mode === 'everyone'
                            ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                >
                    Everyone
                </button>
                <button
                    type="button"
                    onClick={() => setMode('targeted')}
                    className={cn(
                        "flex-1 py-2 px-3 text-sm font-medium rounded-md border transition-all",
                        mode === 'targeted'
                            ? "bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-200"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                >
                    Specific Groups
                </button>
            </div>

            {mode === 'targeted' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Select Roles</div>
                    <div className="grid grid-cols-2 gap-2">
                        {ROLES.map((role) => {
                            const isSelected = selectedRoles.includes(role.id);
                            return (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => toggleRole(role.id)}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded-md border text-left transition-all",
                                        isSelected
                                            ? "bg-white border-purple-500 shadow-sm ring-1 ring-purple-500"
                                            : "bg-white border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full flex items-center justify-center border",
                                        isSelected ? "bg-purple-500 border-purple-500" : "border-gray-300"
                                    )}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <role.icon className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">{role.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    {selectedRoles.length === 0 && (
                        <p className="text-xs text-amber-600 mt-2">
                            * Please select at least one group, otherwise no one will see this.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
