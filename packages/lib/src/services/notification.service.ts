import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { Mutex } from 'async-mutex'
import { z } from 'zod'
import { NotificationStatus, NotificationType } from '../types/notification'
import type { Database } from '../types/supabase'
import { logger } from '../utils/logger'

type Notification = Database['public']['Tables']['notifications']['Row']

const NotificationSchema = z.object({
	type: z.nativeEnum(NotificationType),
	message: z.string().min(1),
	from: z.string().uuid().nullable(),
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
	private supabase
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

	private async hashMetadata(
		metadata: Record<string, unknown>,
	): Promise<string> {
		const metadataString = JSON.stringify(metadata)
		return createHash('sha256').update(metadataString).digest('hex')
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

		// Use mutex to ensure only one processQueue runs at a time
		const release = await this.mutex.acquire()
		const startTime = Date.now()

		try {
			const item = this.queue[0]
			const metadataHash = await this.hashMetadata(item.notification.metadata)
			const { error } = await this.supabase.from('notifications').insert({
				type: item.notification.type,
				message: item.notification.message,
				from: item.notification.from,
				to: item.notification.to,
				metadata: item.notification.metadata,
				metadata_hash: metadataHash,
				delivery_status: NotificationStatus.Pending,
			})

			if (error) throw error

			this.queue.shift()
			this.metrics.successCount++
			this.metrics.lastProcessedAt = new Date()
			this.metrics.processingTime = Date.now() - startTime
			this.metrics.queueSize = this.queue.length

			logger.info('Notification processed successfully', {
				queueSize: this.metrics.queueSize,
				processingTime: this.metrics.processingTime,
				retries: item.retries,
			})
		} catch (error) {
			logger.error('Error processing notification', error)
			this.metrics.errorCount++

			const item = this.queue[0]
			if (item && item.retries < MAX_RETRIES) {
				item.retries++
				release()
				setTimeout(() => this.processQueue(), RETRY_DELAY * item.retries)
				return
			}

			if (item) {
				this.queue.shift()
				logger.warn('Notification processing failed after max retries', {
					queueSize: this.metrics.queueSize,
					retries: item.retries,
				})
			}
		} finally {
			release()
			// Continue processing if there are more items
			if (this.queue.length > 0) {
				await this.processQueue()
			}
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
		await this.processQueue()
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
}
