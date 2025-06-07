export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationPriority = 'low' | 'medium' | 'high'
export type NotificationDeliveryStatus = 'pending' | 'sent' | 'failed'

export type Notification = {
	id: string
	title: string
	message: string
	type: NotificationType
	priority: NotificationPriority
	user_id: string
	is_read: boolean
	read_at: string | null
	action_url: string | null
	metadata: Record<string, unknown> | null
	delivery_status: NotificationDeliveryStatus
	delivery_attempts: number
	last_delivery_attempt: string | null
	created_at: string
	updated_at: string
}

export type CreateNotificationDTO = {
	title: string
	message: string
	type: NotificationType
	priority: NotificationPriority
	user_id: string
	action_url?: string
	metadata?: Record<string, unknown>
}

export type UpdateNotificationDTO = Partial<CreateNotificationDTO> & {
	is_read?: boolean
	delivery_status?: NotificationDeliveryStatus
}

export type NotificationFilters = {
	is_read?: boolean
	type?: NotificationType
	priority?: NotificationPriority
	user_id?: string
	created_after?: Date
	created_before?: Date
}

export type NotificationSort = {
	field: keyof Notification
	direction: 'asc' | 'desc'
}

export type NotificationResponse = {
	data: Notification[]
	count: number
}
