import type { Database } from './database.types'

// Extract table types for easier usage
export type Tables = Database['public']['Tables']
export type Views = Database['public']['Views']
export type Functions = Database['public']['Functions']
export type Enums = Database['public']['Enums']

// Category types
export type Category = Tables['categories']['Row']
export type CategoryInsert = Tables['categories']['Insert']
export type CategoryUpdate = Tables['categories']['Update']

// Comment types
export type Comment = Tables['comments']['Row']
export type CommentInsert = Tables['comments']['Insert']
export type CommentUpdate = Tables['comments']['Update']

// Community types
export type Community = Tables['community']['Row']
export type CommunityInsert = Tables['community']['Insert']
export type CommunityUpdate = Tables['community']['Update']

// Contribution types
export type Contribution = Tables['contributions']['Row']
export type ContributionInsert = Tables['contributions']['Insert']
export type ContributionUpdate = Tables['contributions']['Update']

// Escrow Contract types
export type EscrowContract = Tables['escrow_contracts']['Row']
export type EscrowContractInsert = Tables['escrow_contracts']['Insert']
export type EscrowContractUpdate = Tables['escrow_contracts']['Update']

// Escrow Milestone types
export type EscrowMilestone = Tables['escrow_milestones']['Row']
export type EscrowMilestoneInsert = Tables['escrow_milestones']['Insert']
export type EscrowMilestoneUpdate = Tables['escrow_milestones']['Update']

// Escrow Review types
export type EscrowReview = Tables['escrow_reviews']['Row']
export type EscrowReviewInsert = Tables['escrow_reviews']['Insert']
export type EscrowReviewUpdate = Tables['escrow_reviews']['Update']

// Escrow Status types
export type EscrowStatus = Tables['escrow_status']['Row']
export type EscrowStatusInsert = Tables['escrow_status']['Insert']
export type EscrowStatusUpdate = Tables['escrow_status']['Update']

// Kindler Project types
export type KindlerProject = Tables['kindler_projects']['Row']
export type KindlerProjectInsert = Tables['kindler_projects']['Insert']
export type KindlerProjectUpdate = Tables['kindler_projects']['Update']

// KYC Review types
export type KycReview = Tables['kyc_reviews']['Row']
export type KycReviewInsert = Tables['kyc_reviews']['Insert']
export type KycReviewUpdate = Tables['kyc_reviews']['Update']

// KYC Status types
export type KycStatus = Tables['kyc_status']['Row']
export type KycStatusInsert = Tables['kyc_status']['Insert']
export type KycStatusUpdate = Tables['kyc_status']['Update']

// Milestone types
export type Milestone = Tables['milestones']['Row']
export type MilestoneInsert = Tables['milestones']['Insert']
export type MilestoneUpdate = Tables['milestones']['Update']

// Profile types (User equivalent)
export type Profile = Tables['profiles']['Row']
export type ProfileInsert = Tables['profiles']['Insert']
export type ProfileUpdate = Tables['profiles']['Update']

// Project Member types
export type ProjectMember = Tables['project_members']['Row']
export type ProjectMemberInsert = Tables['project_members']['Insert']
export type ProjectMemberUpdate = Tables['project_members']['Update']

// Project Pitch types
export type ProjectPitch = Tables['project_pitch']['Row']
export type ProjectPitchInsert = Tables['project_pitch']['Insert']
export type ProjectPitchUpdate = Tables['project_pitch']['Update']

// Project Tag Relationship types
export type ProjectTagRelationship = Tables['project_tag_relationships']['Row']
export type ProjectTagRelationshipInsert = Tables['project_tag_relationships']['Insert']
export type ProjectTagRelationshipUpdate = Tables['project_tag_relationships']['Update']

// Project Tag types
export type ProjectTag = Tables['project_tags']['Row']
export type ProjectTagInsert = Tables['project_tags']['Insert']
export type ProjectTagUpdate = Tables['project_tags']['Update']

// Project Update types
export type ProjectUpdate = Tables['project_updates']['Row']
export type ProjectUpdateInsert = Tables['project_updates']['Insert']
export type ProjectUpdateUpdate = Tables['project_updates']['Update']

// Project types (Campaign equivalent)
export type Project = Tables['projects']['Row']
export type ProjectInsert = Tables['projects']['Insert']
export type ProjectUpdateType = Tables['projects']['Update']

// Convenience type aliases for common usage
export type User = Profile
export type UserInsert = ProfileInsert
export type UserUpdate = ProfileUpdate

export type Campaign = Project
export type CampaignInsert = ProjectInsert
export type CampaignUpdate = ProjectUpdateType

// Combined types for complex operations
export type ProjectWithMembers = Project & {
  project_members: ProjectMember[]
}

export type ProjectWithMilestones = Project & {
  milestones: Milestone[]
}

export type ProjectWithUpdates = Project & {
  project_updates: ProjectUpdate[]
}

export type ProjectWithPitch = Project & {
  project_pitch: ProjectPitch | null
}

export type FullProject = Project & {
  category: Category | null
  project_members: ProjectMember[]
  milestones: Milestone[]
  project_updates: ProjectUpdate[]
  project_pitch: ProjectPitch | null
  contributions: Contribution[]
}

export type CommentWithReplies = Comment & {
  replies: Comment[]
}

export type EscrowContractWithReviews = EscrowContract & {
  escrow_reviews: EscrowReview[]
}