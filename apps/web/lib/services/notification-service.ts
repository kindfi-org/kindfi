import { supabase } from '@packages/lib/supabase'
import type {
	BaseNotification,
	CreateNotificationDTO,
	NotificationFilters,
	NotificationSort,
	UpdateNotificationDTO,
} from '../types/notification'
import { NotificationLogger } from './notification-logger'

function isNotification(data: unknown): data is BaseNotification {
	return (
		typeof data === 'object' &&
		data !== null &&
		'id' in data &&
		'title' in data &&
		'body' in data &&
		'type' in data &&
		'priority' in data &&
		'is_read' in data &&
		'user_id' in data &&
		'created_at' in data
	)
}

function isNotificationArray(data: unknown): data is BaseNotification[] {
	return Array.isArray(data) && data.every(isNotification)
}

export interface NotificationPreferences {
	email: boolean
	push: boolean
	in_app: boolean
}

type NotificationUpdate = Partial<
	Omit<BaseNotification, 'id' | 'created_at' | 'updated_at'>
>

export class NotificationService {
	private logger: NotificationLogger

	constructor() {
		this.logger = new NotificationLogger()
	}

	/**
	 * Gets notifications with filtering, sorting, and pagination
	 * @param {NotificationFilters} [filters={}] - Filters to apply
	 * @param {NotificationSort} [sort={ field: 'created_at', direction: 'desc' }] - Sort configuration
	 * @param {number} [page=1] - Page number
	 * @param {number} [pageSize=20] - Number of items per page
	 * @returns {Promise<NotificationResponse>} Paginated notification response
	 */
	async getNotifications(
		filters: NotificationFilters = {},
		sort: NotificationSort = { field: 'created_at', direction: 'desc' },
		page = 1,
		pageSize = 20,
	): Promise<{ data: BaseNotification[]; count: number }> {
		let query = supabase.from('notifications').select('*', { count: 'exact' })

		// Apply filters
		if (filters.is_read !== undefined) {
			query = query.eq('is_read', filters.is_read)
		}
		if (filters.type) {
			query = query.eq('type', filters.type)
		}
		if (filters.priority) {
			query = query.eq('priority', filters.priority)
		}
		if (filters.user_id) {
			query = query.eq('user_id', filters.user_id)
		}
		if (filters.created_after) {
			query = query.gte('created_at', filters.created_after.toISOString())
		}
		if (filters.created_before) {
			query = query.lte('created_at', filters.created_before.toISOString())
		}

		// Apply sorting
		query = query.order(sort.field, { ascending: sort.direction === 'asc' })

		// Apply pagination
		const from = (page - 1) * pageSize
		const to = from + pageSize - 1
		query = query.range(from, to)

		const { data, error, count } = await query

		if (error) {
			await this.logger.logError({
				message: 'Failed to fetch notifications',
				error,
				context: { filters, sort, page, pageSize },
			})
			throw new Error(`Failed to fetch notifications: ${error.message}`)
		}

		if (!isNotificationArray(data)) {
			const validationError = new Error('Invalid notification data structure')
			await this.logger.logError({
				message: 'Invalid notification data structure',
				error: validationError,
				context: { filters, sort, page, pageSize },
			})
			throw validationError
		}

		await this.logger.logInfo({
			message: 'Notifications fetched successfully',
			context: { filters, sort, page, pageSize, count: count || 0 },
		})

		return {
			data: data as BaseNotification[],
			count: count || 0,
		}
	}

	async getUnreadCount(userId: string): Promise<number> {
		const { count, error } = await supabase
			.from('notifications')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', userId)
			.eq('is_read', false)

		if (error) {
			await this.logger.logError({
				message: 'Failed to get unread count',
				error,
				context: { userId },
			})
			throw new Error(`Failed to get unread count: ${error.message}`)
		}

		return count || 0
	}

	/**
	 * Creates a new notification
	 * @param {CreateNotificationDTO} notification - The notification data
	 * @returns {Promise<Notification | null>} The created notification or null if failed
	 */
	async createNotification(
		notification: CreateNotificationDTO,
	): Promise<BaseNotification | null> {
		try {
			const { data, error } = await supabase
				.from('notifications')
				.insert({
					user_id: notification.user_id,
					title: notification.title,
					body: notification.message,
					type: notification.type,
					priority: notification.priority || 'medium',
					is_read: false,
					expires_at: notification.expires_at,
					metadata: notification.metadata,
				})
				.select()
				.single()

			if (error) throw error

			await this.logger.logInfo({
				notificationId: data.id,
				message: 'Notification created',
				context: { notification: data },
			})

			return data
		} catch (error) {
			await this.logger.logError({
				message: 'Failed to create notification',
				error,
				context: { notification },
			})
			return null
		}
	}

	async getNotification(id: string): Promise<BaseNotification> {
		const { data, error } = await supabase
			.from('notifications')
			.select('*')
			.eq('id', id)
			.single()

		if (error) {
			await this.logger.logError({
				message: 'Failed to get notification',
				error,
				context: { id },
			})
			throw new Error(`Failed to get notification: ${error.message}`)
		}

		if (!data || !isNotification(data)) {
			const notFoundError = new Error(
				`Notification ${id} not found or invalid data structure`,
			)
			await this.logger.logError({
				message: 'Notification not found or invalid',
				error: notFoundError,
				context: { id },
			})
			throw notFoundError
		}

		return data
	}

	async updateNotification(
		id: string,
		data: UpdateNotificationDTO,
	): Promise<BaseNotification> {
		const { data: notification, error } = await supabase
			.from('notifications')
			.update(data satisfies NotificationUpdate)
			.eq('id', id)
			.select()
			.single()

		if (error) {
			await this.logger.logError({
				message: 'Failed to update notification',
				error,
				context: { id, ...data },
			})
			throw new Error(`Failed to update notification: ${error.message}`)
		}

		if (!notification || !isNotification(notification)) {
			throw new Error('Failed to update notification: Invalid data returned')
		}

		await this.logger.logInfo({
			notificationId: notification.id,
			message: 'Notification updated successfully',
			context: { id, ...data },
		})

		return notification
	}

	async deleteNotification(id: string): Promise<void> {
		const { error } = await supabase.from('notifications').delete().eq('id', id)

		if (error) {
			await this.logger.logError({
				message: 'Failed to delete notification',
				error,
				context: { id },
			})
			throw new Error(`Failed to delete notification: ${error.message}`)
		}

		await this.logger.logInfo({
			message: 'Notification deleted successfully',
			context: { id },
		})
	}

	/**
	 * Marks a notification as read
	 * @param {string} notificationId - The ID of the notification to mark as read
	 * @returns {Promise<boolean>} Whether the operation was successful
	 */
	async markAsRead(notificationId: string): Promise<boolean> {
		try {
			const { error } = await supabase
				.from('notifications')
				.update({ is_read: true })
				.eq('id', notificationId)

			if (error) throw error
			return true
		} catch (error) {
			console.error('Failed to mark notification as read:', error)
			return false
		}
	}

	/**
	 * Marks all notifications as read for a user
	 * @param {string} userId - The ID of the user
	 * @returns {Promise<boolean>} Whether the operation was successful
	 */
	async markAllAsRead(userId: string): Promise<boolean> {
		try {
			const { error } = await supabase
				.from('notifications')
				.update({ is_read: true })
				.eq('user_id', userId)
				.eq('is_read', false)

			if (error) throw error
			return true
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error)
			return false
		}
	}

	/**
	 * Gets unread notifications for a user
	 * @param {string} userId - The ID of the user
	 * @returns {Promise<Notification[]>} Array of unread notifications
	 */
	async getUnreadNotifications(userId: string): Promise<BaseNotification[]> {
		try {
			const { data, error } = await supabase
				.from('notifications')
				.select('*')
				.eq('user_id', userId)
				.eq('is_read', false)
				.order('created_at', { ascending: false })

			if (error) throw error
			return data || []
		} catch (error) {
			console.error('Failed to get unread notifications:', error)
			return []
		}
	}

	/**
	 * Gets notification preferences for a user
	 * @param {string} userId - The ID of the user
	 * @returns {Promise<NotificationPreferences | null>} User's notification preferences
	 */
	async getNotificationPreferences(
		userId: string,
	): Promise<NotificationPreferences | null> {
		try {
			const { data, error } = await supabase
				.from('notification_preferences')
				.select('*')
				.eq('user_id', userId)
				.single()

			if (error) throw error

			return data
		} catch (error) {
			await this.logger.logError({
				message: 'Failed to get notification preferences',
				error,
				context: { userId },
			})
			return null
		}
	}

	/**
	 * Updates notification preferences for a user
	 * @param {string} userId - The ID of the user
	 * @param {Partial<NotificationPreferences>} preferences - The preferences to update
	 * @returns {Promise<boolean>} Whether the operation was successful
	 */
	async updateNotificationPreferences(
		userId: string,
		preferences: Partial<NotificationPreferences>,
	): Promise<boolean> {
		try {
			const { error } = await supabase.from('notification_preferences').upsert({
				user_id: userId,
				...preferences,
			})

			if (error) throw error

			await this.logger.logInfo({
				message: 'Notification preferences updated',
				context: { userId, preferences },
			})

			return true
		} catch (error) {
			await this.logger.logError({
				message: 'Failed to update notification preferences',
				error,
				context: { userId, preferences },
			})
			return false
		}
	}
}
