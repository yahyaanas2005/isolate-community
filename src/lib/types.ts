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

export type NotificationType =
  | 'MEMBER_JOINED'
  | 'ROLE_CHANGED'
  | 'SERVICE_REQUEST_CREATED'
  | 'SERVICE_REQUEST_ASSIGNED'
  | 'SERVICE_REQUEST_UPDATED'
  | 'INVOICE_ISSUED'
  | 'INVOICE_PAID'
  | 'PAYMENT_RECEIVED'
  | 'EVENT_CREATED'
  | 'EVENT_REMINDER'
  | 'POLL_OPENED'
  | 'POLL_CLOSED'
  | 'POST_CREATED'
  | 'COMMENT_ADDED'
  | 'MENTION'
  | 'SYSTEM_ANNOUNCEMENT';

export interface Notification {
  id: string;
  community_id: string;
  recipient_user_id: string;
  type: NotificationType;
  title: string;
  body?: string;
  data: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  community_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  type_preferences: Record<NotificationType, boolean>;
}

export type SearchContentType = 'POST' | 'COMMENT' | 'COMMUNITY' | 'MEMBER' | 'DOCUMENT' | 'EVENT' | 'POLL';

export interface SearchResult {
  id: string;
  community_id: string;
  content_type: SearchContentType;
  content_id: string;
  title: string;
  body_excerpt: string;
  url_path: string;
  similarity?: number;
}

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  community_id: string;
  member_id: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  created_at: string;
  stripe_payment_url?: string;
}

export interface Payment {
  id: string;
  invoice_id?: string;
  amount: number;
  method: 'ONLINE' | 'CASH' | 'BANK_TRANSFER';
  paid_at: string;
}
