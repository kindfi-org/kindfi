import type { Database } from './database.types'

//  Re-export all enum types from the database
export type CommentType = Database['public']['Enums']['comment_type']
export type EscrowStatusType = Database['public']['Enums']['escrow_status_type']
export type KycStatus = Database['public']['Enums']['kyc_status_enum']
export type KycVerification = Database['public']['Enums']['kyc_verification_enum']
export type MilestoneStatus = Database['public']['Enums']['milestone_status']
export type ProjectMemberRole = Database['public']['Enums']['project_member_role']
export type UserRole = Database['public']['Enums']['user_role']

// Runtime constants for type-safe usage
export const COMMENT_TYPE = {
  COMMENT: 'comment',
  QUESTION: 'question',
  ANSWER: 'answer'
} as const satisfies Record<string, CommentType>

export const ESCROW_STATUS = {
  NEW: 'NEW',
  FUNDED: 'FUNDED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED'
} as const satisfies Record<string, EscrowStatusType>

export const KYC_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  VERIFIED: 'verified'
} as const satisfies Record<string, KycStatus>

export const KYC_VERIFICATION = {
  BASIC: 'basic',
  ENHANCED: 'enhanced'
} as const satisfies Record<string, KycVerification>

export const MILESTONE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISPUTED: 'disputed'
} as const satisfies Record<string, MilestoneStatus>

export const PROJECT_MEMBER_ROLE = {
  ADMIN: 'admin',
  EDITOR: 'editor'
} as const satisfies Record<string, ProjectMemberRole>

export const USER_ROLE = {
  KINDER: 'kinder',
  KINDLER: 'kindler'
} as const satisfies Record<string, UserRole>

// Type guards for runtime validation
export const isCommentType = (value: unknown): value is CommentType => {
  return typeof value === 'string' && Object.values(COMMENT_TYPE).includes(value as CommentType)
}

export const isEscrowStatus = (value: unknown): value is EscrowStatusType => {
  return typeof value === 'string' && Object.values(ESCROW_STATUS).includes(value as EscrowStatusType)
}

export const isKycStatus = (value: unknown): value is KycStatus => {
  return typeof value === 'string' && Object.values(KYC_STATUS).includes(value as KycStatus)
}

export const isKycVerification = (value: unknown): value is KycVerification => {
  return typeof value === 'string' && Object.values(KYC_VERIFICATION).includes(value as KycVerification)
}

export const isMilestoneStatus = (value: unknown): value is MilestoneStatus => {
  return typeof value === 'string' && Object.values(MILESTONE_STATUS).includes(value as MilestoneStatus)
}

export const isProjectMemberRole = (value: unknown): value is ProjectMemberRole => {
  return typeof value === 'string' && Object.values(PROJECT_MEMBER_ROLE).includes(value as ProjectMemberRole)
}

export const isUserRole = (value: unknown): value is UserRole => {
  return typeof value === 'string' && Object.values(USER_ROLE).includes(value as UserRole)
}

// Utility function to get all enum values
export const getEnumValues = {
  commentType: () => Object.values(COMMENT_TYPE),
  escrowStatus: () => Object.values(ESCROW_STATUS),
  kycStatus: () => Object.values(KYC_STATUS),
  kycVerification: () => Object.values(KYC_VERIFICATION),
  milestoneStatus: () => Object.values(MILESTONE_STATUS),
  projectMemberRole: () => Object.values(PROJECT_MEMBER_ROLE),
  userRole: () => Object.values(USER_ROLE)
} as const