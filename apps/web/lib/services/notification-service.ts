import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'
import type {
	BaseNotification,
	CreateNotificationDTO,
	NotificationFilters,
	NotificationResponse,
	NotificationSort,
	UpdateNotificationDTO,
} from '../types/notification'
import { NotificationLogger } from './notification-logger'

function isNotification(data: unknown): data is BaseNotification {
	return (
		typeof data === 'object' &&
		data !== null &&
		'id' in data &&
		'user_id' in data &&
		'title' in data &&
		'message' in data &&
		'type' in data &&
		'is_read' in data &&
		'created_at' in data
	)
}

function isNotificationArray(data: unknown): data is BaseNotification[] {
	return Array.isArray(data) && data.every(isNotification)
}

export class NotificationService {
	private logger: NotificationLogger
	private supabase: ReturnType<typeof createClient>

	constructor(supabaseClient?: ReturnType<typeof createClient>) {
		this.logger = new NotificationLogger()
		this.supabase =
			supabaseClient ||
			createClient(
				env().NEXT_PUBLIC_SUPABASE_URL,
				env().NEXT_PUBLIC_SUPABASE_ANON_KEY,
			)
	}

	async getNotifications(
		filters: NotificationFilters = {},
		sort: NotificationSort = { field: 'created_at', direction: 'desc' },
		page = 1,
		pageSize = 20,
	): Promise<NotificationResponse> {
		let query = this.supabase
			.from('notifications')
			.select('*', { count: 'exact' })

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
		const { count, error } = await this.supabase
			.from('notifications')
			.select('*', { count: 'exact', head: true })
			.eq('is_read', false)
			.eq('user_id', userId)

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

	async createNotification(
		data: CreateNotificationDTO,
	): Promise<BaseNotification> {
		const { data: notification, error } = await this.supabase
			.from('notifications')
			.insert(data as unknown as Record<string, unknown>)
			.select()
			.single()

		if (error) {
			await this.logger.logError({
				message: 'Failed to create notification',
				error,
				context: { ...data },
			})
			throw new Error(`Failed to create notification: ${error.message}`)
		}

		if (!notification || !isNotification(notification)) {
			throw new Error('Failed to create notification: Invalid data returned')
		}

		await this.logger.logInfo({
			notificationId: notification.id,
			message: 'Notification created successfully',
			context: { ...data },
		})

		return notification
	}

	async getNotification(id: string): Promise<BaseNotification> {
		const { data, error } = await this.supabase
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
		const { data: notification, error } = await this.supabase
			.from('notifications')
			.update(data as unknown as Record<string, unknown>)
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
		const { error } = await this.supabase
			.from('notifications')
			.delete()
			.eq('id', id)

		if (error) {
			await this.logger.logError({
				message: 'Failed to delete notification',
				error,
				context: { id },
			})
			throw new Error(`Failed to delete notification: ${error.message}`)
		}

		await this.logger.logInfo({
			notificationId: id,
			message: 'Notification deleted successfully',
		})
	}

	async markAsRead(id: string): Promise<BaseNotification> {
		return this.updateNotification(id, {
			is_read: true,
		})
	}

	async markAllAsRead(): Promise<void> {
		const { error } = await this.supabase
			.from('notifications')
			.update({
				is_read: true,
			})
			.eq('is_read', false)

		if (error) {
			await this.logger.logError({
				message: 'Failed to mark all notifications as read',
				error,
			})
			throw new Error(
				`Failed to mark all notifications as read: ${error.message}`,
			)
		}

		await this.logger.logInfo({
			message: 'All notifications marked as read successfully',
		})
	}

	async deleteExpiredNotifications(): Promise<number> {
		try {
			const { data, error } = await this.supabase
				.from('notifications')
				.delete()
				.lt('expires_at', new Date().toISOString())
				.select('id')

			if (error) throw error

			const deletedCount = data?.length || 0
			await this.logger.logInfo({
				message: 'Expired notifications deleted successfully',
				context: { deletedCount },
			})
			return deletedCount
		} catch (error) {
			await this.logger.logError({
				message: 'Failed to delete expired notifications',
				error,
			})
			throw new Error(
				`Failed to delete expired notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}

	async cleanupOldNotifications(): Promise<void> {
		const thirtyDaysAgo = new Date(
			Date.now() - 30 * 24 * 60 * 60 * 1000,
		).toISOString()
		const sevenDaysAgo = new Date(
			Date.now() - 7 * 24 * 60 * 60 * 1000,
		).toISOString()

		const { data, error } = await this.supabase
			.from('notifications')
			.delete()
			.lt('created_at', thirtyDaysAgo)
			.in('delivery_status', ['delivered', 'failed', 'expired'])
			.or(`and(delivery_status.eq.pending,next_retry_at.lt.${sevenDaysAgo})`)
			.select('id')

		if (error) {
			await this.logger.logError({
				message: 'Failed to cleanup old notifications',
				error,
			})
			throw new Error(`Failed to cleanup old notifications: ${error.message}`)
		}

		await this.logger.logInfo({
			message: 'Old notifications cleaned up successfully',
			context: { deletedCount: data?.length || 0 },
		})
	}
}
