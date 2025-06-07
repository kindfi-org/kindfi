/**
 * Represents the specific type of notification as stored in the database
 */
export type NotificationType =
	| 'project_update'
	| 'project_comment'
	| 'project_investment'
	| 'project_milestone'
	| 'escrow_update'
	| 'escrow_dispute'
	| 'kyc_status'
	| 'system'

/**
 * Represents the UI category/severity of a notification
 */
export type NotificationCategory = 'info' | 'success' | 'warning' | 'error'

/**
 * Maps notification types to their corresponding UI categories
 */
export const notificationTypeToCategory: Record<NotificationType, NotificationCategory> = {
	project_update: 'info',
	project_comment: 'info',
	project_investment: 'success',
	project_milestone: 'success',
	escrow_update: 'info',
	escrow_dispute: 'warning',
	kyc_status: 'info',
	system: 'info'
}

/**
 * Represents the priority level of a notification
 */
export type NotificationPriority = 'low' | 'medium' | 'high'

/**
 * Represents the read status of a notification
 */
export type NotificationReadStatus = 'read' | 'unread'

/**
 * Base interface for notification data
 */
export interface BaseNotification {
	id: string
	user_id: string
	type: NotificationType
	title: string
	message: string
	is_read: boolean
	priority: NotificationPriority
	created_at: string
	updated_at: string
	expires_at?: string
	metadata?: Record<string, unknown>
}

/**
 * Parameters for creating a new notification
 */
export interface CreateNotificationDTO {
	user_id: string
	type: NotificationType
	title: string
	message: string
	priority?: NotificationPriority
	expires_at?: string
	metadata?: Record<string, unknown>
}

/**
 * Parameters for updating an existing notification
 */
export interface UpdateNotificationDTO {
	is_read?: boolean
	priority?: NotificationPriority
	expires_at?: string
	metadata?: Record<string, unknown>
}

/**
 * Parameters for filtering notifications
 */
export interface NotificationFilters {
	is_read?: boolean
	type?: NotificationType
	priority?: NotificationPriority
	user_id?: string
	created_after?: Date
	created_before?: Date
}

/**
 * Parameters for sorting notifications
 */
export interface NotificationSort {
	field: keyof BaseNotification
	direction: 'asc' | 'desc'
}

/**
 * Response type for paginated notification queries
 */
export interface NotificationResponse {
	data: BaseNotification[]
	count: number
}

/**
 * Type guard to check if a value is a valid NotificationType
 */
export function isNotificationType(value: unknown): value is NotificationType {
	return typeof value === 'string' && [
		'project_update',
		'project_comment',
		'project_investment',
		'project_milestone',
		'escrow_update',
		'escrow_dispute',
		'kyc_status',
		'system'
	].includes(value as NotificationType)
}

/**
 * Type guard to check if a value is a valid NotificationCategory
 */
export function isNotificationCategory(value: unknown): value is NotificationCategory {
	return typeof value === 'string' && ['info', 'success', 'warning', 'error'].includes(value as NotificationCategory)
}

/**
 * Type guard to check if a value is a valid NotificationPriority
 */
export function isNotificationPriority(value: unknown): value is NotificationPriority {
	return typeof value === 'string' && ['low', 'medium', 'high'].includes(value as NotificationPriority)
}
