import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import type { Database } from '../types/supabase'
import { logger } from '../utils/logger'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationType = Database['public']['Enums']['notification_type']
type NotificationStatus = Database['public']['Enums']['notification_status']

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

export class NotificationService {
	private supabase
	private readonly MAX_QUEUE_SIZE = 1000
	private isProcessing = false
	private queue: Array<{ notification: CreateNotification; retries: number }> =
		[]

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
		if (this.isProcessing || this.queue.length === 0) return

		this.isProcessing = true
		const item = this.queue[0]

		try {
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
		} catch (error) {
			logger.error('Error processing notification', error)
			if (item.retries < MAX_RETRIES) {
				item.retries++
				setTimeout(() => {
					this.isProcessing = false
					this.processQueue()
				}, RETRY_DELAY * item.retries)
				return
			}
			this.queue.shift()
		}

		this.isProcessing = false
		await this.processQueue()
	}

	public async createNotification(
		notification: CreateNotification,
	): Promise<{ queued: boolean; queueSize: number }> {
		await this.validateNotification(notification)

		if (this.queue.length >= this.MAX_QUEUE_SIZE) {
			logger.warn('Notification queue is full', {
				queueSize: this.queue.length,
			})
			return { queued: false, queueSize: this.queue.length }
		}

		this.queue.push({ notification, retries: 0 })
		await this.processQueue()
		return { queued: true, queueSize: this.queue.length }
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
