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

// =========================================
// SERVICE DESK MODULE
// =========================================

export type ServiceRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ServiceRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ServiceCategory {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string;
}

export interface ServiceRequest {
  id: string;
  tenant_id: string;
  created_by: string;
  assigned_to?: string;
  category_id?: string;
  category?: string;
  title: string;
  description: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
  internal_notes?: string;
  rating?: number; // 1-5
  feedback?: string;
  created_at?: string;
  updated_at?: string;
  closed_at?: string;
  // Joined data
  creator?: Profile;
  assignee?: Profile;
  category_info?: ServiceCategory;
}

export interface ServiceRequestActivity {
  id: string;
  request_id: string;
  user_id: string;
  action: 'created' | 'assigned' | 'status_changed' | 'commented' | 'rated';
  details: Record<string, any>;
  created_at?: string;
  // Joined data
  user?: Profile;
}

// =========================================
// MARKETPLACE MODULE
// =========================================

export type MarketplaceListingStatus = 'ACTIVE' | 'SOLD' | 'HIDDEN' | 'EXPIRED';
export type MarketplaceCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'FOR_PARTS';
export type MarketplaceOfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface MarketplaceListing {
  id: string;
  tenant_id: string;
  seller_id: string;
  title: string;
  description: string;
  price?: number;
  currency?: string;
  condition?: MarketplaceCondition;
  category?: string;
  images?: string[];
  location?: string;
  status: MarketplaceListingStatus;
  created_at?: string;
  updated_at?: string;
  sold_at?: string;
  // Joined data
  seller?: Profile;
  offer_count?: number;
}

export interface MarketplaceOffer {
  id: string;
  listing_id: string;
  buyer_id: string;
  offer_price: number;
  message?: string;
  status: MarketplaceOfferStatus;
  created_at?: string;
  updated_at?: string;
  // Joined data
  buyer?: Profile;
  listing?: MarketplaceListing;
}

// =========================================
// JOB BOARD MODULE
// =========================================

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'VOLUNTEER';
export type JobStatus = 'OPEN' | 'CLOSED' | 'FILLED';
export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'INTERVIEWING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface JobPost {
  id: string;
  tenant_id: string;
  posted_by: string;
  company_name?: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  remote_allowed: boolean;
  job_type?: JobType;
  salary_range?: string;
  application_email?: string;
  application_url?: string;
  status: JobStatus;
  created_at?: string;
  updated_at?: string;
  closed_at?: string;
  // Joined data
  poster?: Profile;
  application_count?: number;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: ApplicationStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  applicant?: Profile;
  job?: JobPost;
}
