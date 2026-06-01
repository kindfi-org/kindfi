import { pgEnum } from 'drizzle-orm/pg-core'

export const backupState = pgEnum('backup_state', ['not_backed_up', 'backed_up'])
export const commentType = pgEnum('comment_type', ['comment', 'question', 'answer'])
export const credentialType = pgEnum('credential_type', ['public-key'])
export const deviceType = pgEnum('device_type', ['single_device', 'multi_device'])
export const escrowStatusType = pgEnum('escrow_status_type', [
	'NEW',
	'FUNDED',
	'ACTIVE',
	'COMPLETED',
	'DISPUTED',
	'CANCELLED',
])
export const kycStatusEnum = pgEnum('kyc_status_enum', [
	'pending',
	'approved',
	'rejected',
	'verified',
])
export const kycVerificationEnum = pgEnum('kyc_verification_enum', ['basic', 'enhanced'])
export const milestoneStatus = pgEnum('milestone_status', [
	'pending',
	'completed',
	'approved',
	'rejected',
	'disputed',
])
export const notificationDeliveryStatus = pgEnum('notification_delivery_status', [
	'pending',
	'delivered',
	'failed',
])
export const notificationPriority = pgEnum('notification_priority', [
	'low',
	'medium',
	'high',
	'urgent',
])
export const notificationType = pgEnum('notification_type', ['info', 'success', 'warning', 'error'])
export const profileVerificationStatus = pgEnum('profile_verification_status', [
	'unverified',
	'verified',
])
export const projectMemberRole = pgEnum('project_member_role', [
	'admin',
	'editor',
	'advisor',
	'community',
	'core',
	'others',
])
export const projectStatus = pgEnum('project_status', [
	'draft',
	'review',
	'active',
	'paused',
	'funded',
	'rejected',
])
export const userRole = pgEnum('user_role', ['kinder', 'kindler'])
