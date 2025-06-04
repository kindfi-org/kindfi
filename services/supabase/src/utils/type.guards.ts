import type { Tables, Enums } from '../database.types'

// Database table type aliases for cleaner code
type Project = Tables<'projects'>
type Milestone = Tables<'milestones'>
type EscrowContract = Tables<'escrow_contracts'>
type Profile = Tables<'profiles'>
type Contribution = Tables<'contributions'>
type ProjectUpdate = Tables<'project_updates'>
type Comment = Tables<'comments'>
type Category = Tables<'categories'>

// Enum type aliases
type MilestoneStatus = Enums<'milestone_status'>
type EscrowStatusType = Enums<'escrow_status_type'>
type UserRole = Enums<'user_role'>
type KycStatusEnum = Enums<'kyc_status_enum'>
type CommentType = Enums<'comment_type'>

// Entity type guards
export const isProject = (obj: unknown): obj is Project => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).title === 'string' &&
    typeof (obj as any).target_amount === 'number' &&
    typeof (obj as any).current_amount === 'number' &&
    typeof (obj as any).owner_id === 'string' &&
    typeof (obj as any).min_investment === 'number' &&
    typeof (obj as any).investors_count === 'number' &&
    typeof (obj as any).percentage_complete === 'number'
  )
}

export const isMilestone = (obj: unknown): obj is Milestone => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).project_id === 'string' &&
    typeof (obj as any).title === 'string' &&
    typeof (obj as any).amount === 'number' &&
    typeof (obj as any).order_index === 'number' &&
    typeof (obj as any).deadline === 'string' &&
    ['pending', 'completed', 'approved', 'rejected', 'disputed'].includes((obj as any).status)
  )
}

export const isEscrowContract = (obj: unknown): obj is EscrowContract => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).project_id === 'string' &&
    typeof (obj as any).contribution_id === 'string' &&
    typeof (obj as any).engagement_id === 'string' &&
    typeof (obj as any).contract_id === 'string' &&
    typeof (obj as any).amount === 'number' &&
    typeof (obj as any).platform_fee === 'number' &&
    typeof (obj as any).payer_address === 'string' &&
    typeof (obj as any).receiver_address === 'string' &&
    ['NEW', 'FUNDED', 'ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED'].includes((obj as any).current_state)
  )
}

export const isProfile = (obj: unknown): obj is Profile => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).display_name === 'string' &&
    ['kinder', 'kindler'].includes((obj as any).role)
  )
}

export const isContribution = (obj: unknown): obj is Contribution => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).project_id === 'string' &&
    typeof (obj as any).contributor_id === 'string' &&
    typeof (obj as any).amount === 'number'
  )
}

export const isProjectUpdate = (obj: unknown): obj is ProjectUpdate => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).project_id === 'string' &&
    typeof (obj as any).author_id === 'string' &&
    typeof (obj as any).title === 'string' &&
    typeof (obj as any).content === 'string'
  )
}

export const isComment = (obj: unknown): obj is Comment => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).author_id === 'string' &&
    typeof (obj as any).content === 'string' &&
    ['comment', 'question', 'answer'].includes((obj as any).type)
  )
}

export const isCategory = (obj: unknown): obj is Category => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).name === 'string' &&
    typeof (obj as any).color === 'string'
  )
}

// Array type guards
export const isProjectArray = (arr: unknown): arr is Project[] => {
  return Array.isArray(arr) && arr.every(isProject)
}

export const isMilestoneArray = (arr: unknown): arr is Milestone[] => {
  return Array.isArray(arr) && arr.every(isMilestone)
}

export const isEscrowContractArray = (arr: unknown): arr is EscrowContract[] => {
  return Array.isArray(arr) && arr.every(isEscrowContract)
}

export const isProfileArray = (arr: unknown): arr is Profile[] => {
  return Array.isArray(arr) && arr.every(isProfile)
}

export const isContributionArray = (arr: unknown): arr is Contribution[] => {
  return Array.isArray(arr) && arr.every(isContribution)
}

export const isProjectUpdateArray = (arr: unknown): arr is ProjectUpdate[] => {
  return Array.isArray(arr) && arr.every(isProjectUpdate)
}

export const isCommentArray = (arr: unknown): arr is Comment[] => {
  return Array.isArray(arr) && arr.every(isComment)
}

export const isCategoryArray = (arr: unknown): arr is Category[] => {
  return Array.isArray(arr) && arr.every(isCategory)
}

// Enum type guards
export const isMilestoneStatus = (value: unknown): value is MilestoneStatus => {
  return typeof value === 'string' && 
    ['pending', 'completed', 'approved', 'rejected', 'disputed'].includes(value)
}

export const isEscrowStatusType = (value: unknown): value is EscrowStatusType => {
  return typeof value === 'string' && 
    ['NEW', 'FUNDED', 'ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED'].includes(value)
}

export const isUserRole = (value: unknown): value is UserRole => {
  return typeof value === 'string' && ['kinder', 'kindler'].includes(value)
}

export const isKycStatus = (value: unknown): value is KycStatusEnum => {
  return typeof value === 'string' && 
    ['pending', 'approved', 'rejected', 'verified'].includes(value)
}

export const isCommentType = (value: unknown): value is CommentType => {
  return typeof value === 'string' && 
    ['comment', 'question', 'answer'].includes(value)
}

// Utility function to validate API responses
export const validateApiResponse = <T>(
  data: unknown,
  validator: (obj: unknown) => obj is T
): T => {
  if (!validator(data)) {
    throw new Error('Invalid API response data structure')
  }
  return data
}

// Enhanced validation with detailed error messages
export const validateApiResponseWithDetails = <T>(
  data: unknown,
  validator: (obj: unknown) => obj is T,
  entityName: string
): T => {
  if (!validator(data)) {
    console.error(`Invalid ${entityName} data structure:`, data)
    throw new Error(`Invalid API response: Expected ${entityName} but received invalid data structure`)
  }
  return data
}

// Utility function for optional field validation
export const validateOptionalField = <T>(
  value: unknown,
  validator: (obj: unknown) => obj is T
): T | null => {
  if (value === null || value === undefined) {
    return null
  }
  return validator(value) ? value : null
}