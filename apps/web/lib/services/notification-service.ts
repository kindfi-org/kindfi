import { createClient } from '@supabase/supabase-js'
import type {
	CreateNotificationDTO,
	Notification,
	NotificationFilters,
	NotificationResponse,
	NotificationSort,
	UpdateNotificationDTO,
} from '../types/notification'
import { NotificationLogger } from './notification-logger'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export class NotificationService {
	private logger: NotificationLogger

	constructor() {
		this.logger = new NotificationLogger()
	}

	async getNotifications(
		filters: NotificationFilters = {},
		sort: NotificationSort = { field: 'created_at', direction: 'desc' },
		page = 1,
		pageSize = 20,
	): Promise<NotificationResponse> {
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

		await this.logger.logInfo({
			message: 'Notifications fetched successfully',
			context: { filters, sort, page, pageSize, count: count || 0 },
		})

		return {
			data: data as Notification[],
			count: count || 0,
		}
	}

	async getUnreadCount(): Promise<number> {
		const { count, error } = await supabase
			.from('notifications')
			.select('*', { count: 'exact', head: true })
			.eq('is_read', false)

		if (error) {
			await this.logger.logError({
				message: 'Failed to get unread count',
				error,
			})
			throw new Error(`Failed to get unread count: ${error.message}`)
		}

		await this.logger.logInfo({
			message: 'Unread count fetched successfully',
			context: { count: count || 0 },
		})

		return count || 0
	}

	async createNotification(data: CreateNotificationDTO): Promise<Notification> {
		const { data: notification, error } = await supabase
			.from('notifications')
			.insert(data)
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

		if (!notification) {
			throw new Error('Failed to create notification: No data returned')
		}

		await this.logger.logInfo({
			notificationId: notification.id,
			message: 'Notification created successfully',
			context: { ...data },
		})

		return notification as Notification
	}

	async getNotification(id: string): Promise<Notification> {
		const { data: notification, error } = await supabase
			.from('notifications')
			.select()
			.eq('id', id)
			.single()

		if (error) throw error
		return notification
	}

	async updateNotification(
		id: string,
		data: UpdateNotificationDTO,
	): Promise<Notification> {
		const { data: notification, error } = await supabase
			.from('notifications')
			.update(data)
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

		if (!notification) {
			throw new Error('Failed to update notification: No data returned')
		}

		await this.logger.logInfo({
			notificationId: notification.id,
			message: 'Notification updated successfully',
			context: { id, ...data },
		})

		return notification as Notification
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
	}

	async markAsRead(id: string): Promise<Notification> {
		return this.updateNotification(id, {
			is_read: true,
		})
	}

	async markAllAsRead(): Promise<void> {
		const { error } = await supabase
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
	}

	async deleteExpiredNotifications(): Promise<void> {
		const { error } = await supabase
			.from('notifications')
			.delete()
			.lt('expires_at', new Date().toISOString())

		if (error) throw error
	}
}
