export interface Committee {
    id: string;
    community_id: string;
    name: string;
    description: string;
    type: 'MANAGEMENT' | 'ADVISORY' | 'SPECIAL';
    created_at: string;
}

export interface CommitteeMember {
    id: string;
    committee_id: string;
    member_id: string;
    role: 'PRESIDENT' | 'SECRETARY' | 'TREASURER' | 'MEMBER';
    joined_at: string;
}

export interface Meeting {
    id: string;
    committee_id: string;
    title: string;
    agenda: string;
    meeting_date: string;
    location: string;
    minutes?: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    created_at: string;
}
