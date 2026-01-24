// =========================================
// ENUMS & BASE TYPES
// =========================================

export type CommunityType = 'Physical' | 'Professional' | 'Virtual';
export type UserRole = 'Owner' | 'Admin' | 'Sub-Admin' | 'Staff' | 'Member';
export type MembershipStatus = 'active' | 'inactive' | 'suspended';
export type GroupRole = 'admin' | 'member';

// =========================================
// TENANT (COMMUNITY)
// =========================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: CommunityType;
  description?: string;
  settings?: Record<string, any>;
  invite_code?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

// =========================================
// PROFILE (USER)
// =========================================

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  location?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// =========================================
// MEMBERSHIP
// =========================================

// Discriminated Union for Dynamic Data
export type PhysicalMemberData = {
  unit_number: string;
  resident_type: 'Owner' | 'Tenant';
};

export type ProfessionalMemberData = {
  license_id: string;
  specialization: string;
};

export type VirtualMemberData = {
  gamertag?: string;
  reputation_score?: number;
};

export type DynamicData =
  | PhysicalMemberData
  | ProfessionalMemberData
  | VirtualMemberData
  | Record<string, any>;

export interface Membership {
  id: string;
  user_id: string;
  tenant_id: string;
  role: UserRole;
  status: MembershipStatus;
  dynamic_data: DynamicData;
  joined_at?: string;
  deactivated_at?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  profile?: Profile;
  tenant?: Tenant;
}

// =========================================
// GROUPS
// =========================================

export interface Group {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  creator?: Profile;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at?: string;
  // Joined data
  profile?: Profile;
  group?: Group;
}

// =========================================
// POSTS & DISCUSSIONS
// =========================================

export interface Post {
  id: string;
  tenant_id: string;
  author_id: string;
  group_id?: string;
  title?: string;
  content: string;
  attachments?: Array<{
    type: 'image' | 'file' | 'video';
    url: string;
    name: string;
  }>;
  category?: string;
  tags?: string[];
  is_pinned: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined data
  author?: Profile;
  group?: Group;
  comment_count?: number;
  reaction_counts?: Record<string, number>;
  user_reaction?: string; // Current user's reaction emoji
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  author?: Profile;
  replies?: Comment[];
  reaction_counts?: Record<string, number>;
}

export interface Reaction {
  id: string;
  post_id?: string;
  comment_id?: string;
  user_id: string;
  emoji: string;
  created_at?: string;
}
