import type { Database } from '@services/supabase'
import type { notificationsRowSchema } from '@services/supabase'
import type { z } from 'zod'
import { createSupabaseBrowserClient } from '../supabase/client'
import { logger } from '../utils/logger'

export type Notification = z.infer<typeof notificationsRowSchema>
export type Json =
	Database['public']['Tables']['notifications']['Row']['metadata']

export async function createNotification({
	type,
	message,
	from,
	to,
	metadata = {},
}: {
	type: Notification['type']
	message: string
	from?: string
	to: string
	metadata?: Json
}): Promise<string> {
	const supabase = createSupabaseBrowserClient()
	const { data, error } = await supabase.rpc('create_notification', {
		p_type: type,
		p_message: message,
		p_from: from ?? null,
		p_to: to,
		p_metadata: metadata,
	})

	if (error) {
		throw error
	}

	return data
}

export async function markNotificationsAsRead(
	notificationIds: string[],
): Promise<void> {
	const supabase = createSupabaseBrowserClient()
	const { error } = await supabase.rpc('mark_notifications_as_read', {
		p_notification_ids: notificationIds,
	})

	if (error) {
		throw error
	}
}

export async function getNotifications(
	userId: string,
	page = 1,
	pageSize = 10,
) {
	const supabase = createSupabaseBrowserClient()
	const { data, error } = await supabase
		.from('notifications')
		.select('*')
		.eq('to', userId)
		.order('created_at', { ascending: false })
		.range((page - 1) * pageSize, page * pageSize - 1)

	if (error) {
		throw error
	}

	return data as Notification[]
}

export async function getUnreadCount(userId: string) {
	const supabase = createSupabaseBrowserClient()
	const { count, error } = await supabase
		.from('notifications')
		.select('*', { count: 'exact', head: true })
		.eq('to', userId)
		.is('read_at', null)

	if (error) {
		throw error
	}

	return count ?? 0
}

export class NotificationService {
	private supabase

	constructor() {
		this.supabase = createSupabaseBrowserClient()
	}

	/**
	 * Create a new notification with retry logic
	 */
	async createNotification(data: {
		type: Notification['type']
		message: string
		from?: string
		to: string
		metadata?: Json
	}): Promise<string> {
		try {
			const { type, message, from, to, metadata } = data

			const { data: notification, error } = await this.supabase.rpc(
				'create_notification',
				{
					p_type: type,
					p_message: message,
					p_from: from ?? null,
					p_to: to,
					p_metadata: metadata ?? {},
				},
			)

			if (error) {
				throw error
			}

			return notification
		} catch (error) {
			logger.error('Error in createNotification:', error)
			throw error
		}
	}

	/**
	 * Get notifications for a user with pagination
	 */
	async getNotifications(userId: string, page = 1, pageSize = 10) {
		try {
			const { data, count, error } = await this.supabase
				.from('notifications')
				.select('*', { count: 'exact' })
				.eq('to', userId)
				.order('created_at', { ascending: false })
				.range((page - 1) * pageSize, page * pageSize - 1)

			if (error) {
				throw error
			}

			return {
				notifications: data as Notification[],
				total: count || 0,
			}
		} catch (error) {
			logger.error('Error in getNotifications:', error)
			throw error
		}
	}

	/**
	 * Mark notifications as read
	 */
	async markAsRead(data: { notificationIds: string[] }): Promise<void> {
		try {
			const { notificationIds } = data

			const { error } = await this.supabase.rpc('mark_notifications_as_read', {
				p_notification_ids: notificationIds,
			})

			if (error) {
				throw error
			}
		} catch (error) {
			logger.error('Error in markAsRead:', error)
			throw error
		}
	}

	/**
	 * Subscribe to new notifications
	 */
	subscribeToNotifications(
		userId: string,
		callback: (notification: Notification) => void,
	) {
		return this.supabase
			.channel('notifications')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'notifications',
					filter: `to=eq.${userId}`,
				},
				(payload) => {
					try {
						const notification = payload.new as Notification
						callback(notification)
					} catch (error) {
						logger.error('Error in notification subscription:', error)
					}
				},
			)
			.subscribe()
	}
}
