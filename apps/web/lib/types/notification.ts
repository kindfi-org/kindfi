/**
 * Represents the specific type of notification as stored in the database
 */
const NOTIFICATION_TYPES = [
	'project_update',
	'project_comment',
	'project_investment',
	'project_milestone',
	'escrow_update',
	'escrow_dispute',
	'kyc_status',
	'system',
] as const

/**
 * Represents the UI category/severity of a notification
 */
const NOTIFICATION_CATEGORIES = ['info', 'success', 'warning', 'error'] as const

/**
 * Represents the priority level of a notification
 */
const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high'] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number]

/**
 * Maps notification types to their corresponding UI categories
 */
export const notificationTypeToCategory: Record<
	NotificationType,
	NotificationCategory
> = {
	project_update: 'info',
	project_comment: 'info',
	project_investment: 'success',
	project_milestone: 'success',
	escrow_update: 'info',
	escrow_dispute: 'warning',
	kyc_status: 'info',
	system: 'info',
}

/**
 * Represents the read status of a notification
 */
export type NotificationReadStatus = 'read' | 'unread'

/**
 * Base interface for notification data
 */
export interface BaseNotification {
	/** Unique identifier for the notification */
	id: string
	/** ID of the user who owns this notification */
	user_id: string
	/** Type of notification (e.g., project_update, system) */
	type: NotificationType
	/** Short title of the notification */
	title: string
	/** Detailed message content */
	message: string
	/** Whether the notification has been read by the user */
	is_read: boolean
	/** Priority level of the notification */
	priority: NotificationPriority
	/** ISO timestamp when the notification was created */
	created_at: string
	/** ISO timestamp when the notification was last updated */
	updated_at: string
	/** Optional ISO timestamp when the notification expires */
	expires_at?: string
	/** Optional additional data specific to the notification type */
	metadata?: Record<string, unknown>
}

/**
 * Parameters for creating a new notification
 */
export interface CreateNotificationDTO {
	/** ID of the user who will receive the notification */
	user_id: string
	/** Type of notification to create */
	type: NotificationType
	/** Short title of the notification */
	title: string
	/** Detailed message content */
	message: string
	/** Optional priority level (defaults to 'medium') */
	priority?: NotificationPriority
	/** Optional ISO timestamp when the notification should expire */
	expires_at?: string
	/** Optional additional data specific to the notification type */
	metadata?: Record<string, unknown>
}

/**
 * Parameters for updating an existing notification
 */
export interface UpdateNotificationDTO {
	/** Whether to mark the notification as read */
	is_read?: boolean
	/** New priority level for the notification */
	priority?: NotificationPriority
	/** New expiration timestamp */
	expires_at?: string
	/** Updated metadata for the notification */
	metadata?: Record<string, unknown>
}

/**
 * Parameters for filtering notifications
 */
export interface NotificationFilters {
	/** Filter by read status */
	is_read?: boolean
	/** Filter by notification type */
	type?: NotificationType
	/** Filter by priority level */
	priority?: NotificationPriority
	/** Filter by user ID */
	user_id?: string
	/** Filter notifications created after this date */
	created_after?: Date
	/** Filter notifications created before this date */
	created_before?: Date
}

/**
 * Parameters for sorting notifications
 */
export interface NotificationSort {
	/** Field to sort by (must be a key of BaseNotification) */
	field: keyof BaseNotification
	/** Sort direction */
	direction: 'asc' | 'desc'
}

/**
 * Response type for paginated notification queries
 */
export interface NotificationResponse {
	/** Array of notifications matching the query */
	data: BaseNotification[]
	/** Total count of notifications matching the query */
	count: number
}

/**
 * Type guard to check if a value is a valid NotificationType
 */
export function isNotificationType(value: unknown): value is NotificationType {
	return (
		typeof value === 'string' &&
		NOTIFICATION_TYPES.includes(value as NotificationType)
	)
}

/**
 * Type guard to check if a value is a valid NotificationCategory
 */
export function isNotificationCategory(
	value: unknown,
): value is NotificationCategory {
	return (
		typeof value === 'string' &&
		NOTIFICATION_CATEGORIES.includes(value as NotificationCategory)
	)
}

/**
 * Type guard to check if a value is a valid NotificationPriority
 */
export function isNotificationPriority(
	value: unknown,
): value is NotificationPriority {
	return (
		typeof value === 'string' &&
		NOTIFICATION_PRIORITIES.includes(value as NotificationPriority)
	)
}
