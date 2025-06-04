import type { Database } from '@services/supabase'

/**
 * Represents a user notification in the system, including its type, message, metadata, and status fields.
 */
export type Notification = Database['public']['Tables']['notifications']['Row']

/**
 * Enum of possible notification types. Should match the database enum values.
 */
export type NotificationType = Database['public']['Enums']['notification_type']

/**
 * Metadata associated with a notification. Structure may vary by notification type.
 */
export type NotificationMetadata =
	Database['public']['Tables']['notifications']['Row']['metadata']

/**
 * Type guard to check if a value is a valid NotificationType.
 */
export function isNotificationType(value: unknown): value is NotificationType {
	const validTypes = [
		'PROJECT_UPDATE',
		'MILESTONE_COMPLETED',
		'ESCROW_RELEASED',
		'KYC_STATUS_CHANGE',
		'COMMENT_ADDED',
		'MEMBER_JOINED',
		'SYSTEM_ALERT',
	]
	return typeof value === 'string' && validTypes.includes(value)
}

/**
 * Type guard to check if an object conforms to the Notification type structure.
 */
export function isNotification(obj: unknown): obj is Notification {
	if (typeof obj !== 'object' || obj === null) return false
	const n = obj as Record<string, unknown>
	return (
		typeof n.id === 'string' &&
		typeof n.message === 'string' &&
		'created_at' in n &&
		typeof n.created_at === 'string' &&
		'type' in n &&
		isNotificationType(n.type)
	)
}
