export type CommunityType = 'Physical' | 'Professional' | 'Virtual';
export type UserRole = 'Owner' | 'Admin' | 'Staff' | 'Member';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: CommunityType;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

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
  | {}; // Fallback

export interface Membership {
  id: string;
  user_id: string;
  tenant_id: string;
  role: UserRole;
  dynamic_data: DynamicData;
  profile?: Profile; // Joined data
  created_at?: string;
}
