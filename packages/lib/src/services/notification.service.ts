import { createHash } from 'node:crypto'
import type { Database } from '@services/supabase'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Mutex } from 'async-mutex'
import { z } from 'zod'
import { logger } from '../utils/logger'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationType = Database['public']['Enums']['notification_type']
type NotificationMetadata =
	Database['public']['Tables']['notifications']['Row']['metadata']

const NotificationSchema = z.object({
	type: z.enum([
		'PROJECT_UPDATE',
		'MILESTONE_COMPLETED',
		'ESCROW_RELEASED',
		'KYC_STATUS_CHANGE',
		'COMMENT_ADDED',
		'MEMBER_JOINED',
		'SYSTEM_ALERT',
	]),
	message: z.string().min(1),
	to: z.string().uuid(),
	metadata: z.record(z.unknown()).default({}),
})

type CreateNotification = z.infer<typeof NotificationSchema>

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

interface QueueMetrics {
	queueSize: number
	processingTime: number
	lastProcessedAt: Date | null
	errorCount: number
	successCount: number
}

export class NotificationService {
	private supabase: SupabaseClient<Database>
	private readonly MAX_QUEUE_SIZE = 1000
	private readonly mutex = new Mutex()
	private queue: Array<{ notification: CreateNotification; retries: number }> =
		[]
	private metrics: QueueMetrics = {
		queueSize: 0,
		processingTime: 0,
		lastProcessedAt: null,
		errorCount: 0,
		successCount: 0,
	}

	constructor(supabaseUrl: string, supabaseKey: string) {
		this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
	}

	private async validateNotification(
		notification: CreateNotification,
	): Promise<void> {
		try {
			await NotificationSchema.parseAsync(notification)
		} catch (error) {
			logger.error('Invalid notification', error)
			throw new Error(
				`Invalid notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}

	private async processQueue(): Promise<void> {
		if (this.queue.length === 0) return

		const release = await this.mutex.acquire()
		const startTime = Date.now()

		try {
			while (this.queue.length > 0) {
				const batch = this.queue.splice(0, 10)
				const notificationsToInsert = batch.map((item) => ({
					type: (typeof item.notification.type === 'string'
						? item.notification.type.toUpperCase()
						: item.notification.type) as NotificationType,
					message: item.notification.message,
					to: item.notification.to,
					metadata: item.notification.metadata as NotificationMetadata,
					created_at: new Date().toISOString(),
					read_at: null,
				}))
				const { error } = await this.supabase
					.from('notifications')
					.insert(notificationsToInsert)
				if (error) throw error
				this.metrics.successCount += batch.length
				this.metrics.lastProcessedAt = new Date()
				this.metrics.processingTime = Date.now() - startTime
				this.metrics.queueSize = this.queue.length
				logger.info('Batch notification processed successfully', {
					queueSize: this.metrics.queueSize,
					processingTime: this.metrics.processingTime,
					batchSize: batch.length,
				})
			}
		} catch (error) {
			logger.error('Error processing notification batch', error)
			this.metrics.errorCount++
		} finally {
			release()
		}
	}

	public async createNotification(
		notification: CreateNotification,
	): Promise<{ queued: boolean; queueSize: number }> {
		await this.validateNotification(notification)

		if (this.queue.length >= this.MAX_QUEUE_SIZE) {
			logger.warn('Notification queue is full', {
				queueSize: this.metrics.queueSize,
			})
			return { queued: false, queueSize: this.metrics.queueSize }
		}

		this.queue.push({ notification, retries: 0 })
		this.metrics.queueSize = this.queue.length
		try {
			await this.processQueue()
		} catch (error) {
			logger.error('Error in processQueue during createNotification', error)
		}
		return { queued: true, queueSize: this.metrics.queueSize }
	}

	public getMetrics(): QueueMetrics {
		return { ...this.metrics }
	}

	public subscribeToNotifications(
		userId: string,
		callback: (notification: Notification) => void,
	): () => void {
		const channel = this.supabase
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
					const newNotification = payload.new
					if (
						!newNotification ||
						typeof newNotification !== 'object' ||
						!('id' in newNotification)
					) {
						logger.warn('Invalid notification payload', payload)
						return
					}
					callback(newNotification as Notification)
				},
			)
			.subscribe()

		return () => {
			this.supabase.removeChannel(channel)
		}
	}

	public async markAsRead(
		notificationId: string,
		userId: string,
	): Promise<void> {
		try {
			// Check that the notification belongs to the user
			const { data, error: fetchError } = await this.supabase
				.from('notifications')
				.select('id, to')
				.eq('id', notificationId)
				.single()
			if (fetchError) throw fetchError
			if (!data || data.to !== userId) {
				throw new Error('Unauthorized: Notification does not belong to user')
			}
			const { error } = await this.supabase
				.from('notifications')
				.update({ read_at: new Date().toISOString() })
				.eq('id', notificationId)
			if (error) throw error
		} catch (error) {
			logger.error('Error marking notification as read', error)
			throw error
		}
	}
}
