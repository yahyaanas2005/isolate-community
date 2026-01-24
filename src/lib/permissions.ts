// =========================================
// PERMISSION UTILITIES
// =========================================
// Role-based access control helpers

import { UserRole } from './types';

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: UserRole[] = ['Member', 'Staff', 'Sub-Admin', 'Admin', 'Owner'];

/**
 * Check if a role has at least a certain permission level
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
    const userLevel = ROLE_HIERARCHY.indexOf(userRole);
    const minimumLevel = ROLE_HIERARCHY.indexOf(minimumRole);
    return userLevel >= minimumLevel;
}

/**
 * Check if user is Owner or Admin
 */
export function isOwnerOrAdmin(role: UserRole): boolean {
    return role === 'Owner' || role === 'Admin';
}

/**
 * Check if user is Owner
 */
export function isOwner(role: UserRole): boolean {
    return role === 'Owner';
}

/**
 * Check if user can manage members (assign roles, suspend, etc.)
 */
export function canManageMembers(role: UserRole): boolean {
    return hasMinimumRole(role, 'Admin');
}

/**
 * Check if user can edit community settings
 */
export function canManageCommunity(role: UserRole): boolean {
    return hasMinimumRole(role, 'Admin');
}

/**
 * Check if user can delete the community
 */
export function canDeleteCommunity(role: UserRole): boolean {
    return role === 'Owner';
}

/**
 * Check if user can create posts
 */
export function canCreatePost(role: UserRole): boolean {
    return true; // All members can create posts
}

/**
 * Check if user can edit a post
 * @param role - User's role in the community
 * @param isAuthor - Whether user is the post author
 */
export function canEditPost(role: UserRole, isAuthor: boolean): boolean {
    return isAuthor; // Only authors can edit their own posts
}

/**
 * Check if user can delete a post
 * @param role - User's role in the community
 * @param isAuthor - Whether user is the post author
 */
export function canDeletePost(role: UserRole, isAuthor: boolean): boolean {
    return isAuthor || hasMinimumRole(role, 'Sub-Admin');
}

/**
 * Check if user can pin a post
 */
export function canPinPost(role: UserRole): boolean {
    return hasMinimumRole(role, 'Admin');
}

/**
 * Check if user can create groups
 */
export function canCreateGroup(role: UserRole): boolean {
    return true; // All members can create groups
}

/**
 * Check if user can manage a group
 * @param role - User's role in the community
 * @param isGroupAdmin - Whether user is a group admin
 * @param isGroupCreator - Whether user created the group
 */
export function canManageGroup(
    role: UserRole,
    isGroupAdmin: boolean,
    isGroupCreator: boolean
): boolean {
    return isGroupCreator || isGroupAdmin || hasMinimumRole(role, 'Admin');
}

/**
 * Get available roles that a user can assign based on their own role
 * Owners can assign all roles, Admins can assign up to Admin, etc.
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
    const userLevel = ROLE_HIERARCHY.indexOf(userRole);
    if (userLevel === -1) return [];

    // Can assign any role up to (but not including) own level, unless Owner
    if (userRole === 'Owner') {
        return [...ROLE_HIERARCHY]; // Owners can assign all roles
    }

    return ROLE_HIERARCHY.slice(0, userLevel);
}

/**
 * Check if user can assign a specific role
 */
export function canAssignRole(userRole: UserRole, targetRole: UserRole): boolean {
    const assignableRoles = getAssignableRoles(userRole);
    return assignableRoles.includes(targetRole);
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: UserRole): string {
    switch (role) {
        case 'Owner':
            return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        case 'Admin':
            return 'bg-red-500/20 text-red-300 border-red-500/30';
        case 'Sub-Admin':
            return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
        case 'Staff':
            return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case 'Member':
            return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        default:
            return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
}

/**
 * Get membership status badge color
 */
export function getStatusBadgeColor(status: 'active' | 'inactive' | 'suspended'): string {
    switch (status) {
        case 'active':
            return 'bg-green-500/20 text-green-300 border-green-500/30';
        case 'inactive':
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        case 'suspended':
            return 'bg-red-500/20 text-red-300 border-red-500/30';
        default:
            return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
}
