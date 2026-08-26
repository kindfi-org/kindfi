import { supabase } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'

const NOTIFICATION_LOGS_TABLE = 'notification_logs' as const

type UntypedSupabase = typeof supabase & {
	from: (table: string) => ReturnType<typeof supabase.from>
}

function serializeLogError(value: unknown): Record<string, unknown> {
	if (value instanceof Error) {
		return {
			name: value.name,
			message: value.message,
			stack: value.stack,
		}
	}
	if (value !== null && typeof value === 'object') {
		const o = value as Record<string, unknown>
		return {
			message: o.message,
			code: o.code,
			details: o.details,
			hint: o.hint,
		}
	}
	return { message: String(value) }
}

interface LogErrorParams {
	message: string
	error: unknown
	context?: Record<string, unknown>
	notificationId?: string
}

interface LogInfoParams {
	notificationId?: string
	message: string
	context?: Record<string, unknown>
}

interface LogWarningParams {
	notificationId?: string
	message: string
	context?: Record<string, unknown>
}

interface NotificationLog {
	id: string
	notification_id: string | null
	level: 'error' | 'info' | 'warning'
	message: string
	metadata?: Record<string, unknown>
	created_at: string
}

function getSupabase(): UntypedSupabase {
	return supabase as UntypedSupabase
}

export class NotificationLogger {
	async logError({ message, error, context, notificationId }: LogErrorParams): Promise<void> {
		try {
			const { error: dbError } = await getSupabase()
				.from(NOTIFICATION_LOGS_TABLE)
				.insert({
					notification_id: notificationId,
					level: 'error',
					message,
					metadata: {
						...context,
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					},
				})

			if (dbError) throw dbError
		} catch (logError) {
			logger.error('[NotificationLogger] Failed to log error:', serializeLogError(logError))
		}
	}

	async logInfo({ notificationId, message, context }: LogInfoParams): Promise<void> {
		try {
			const { error } = await getSupabase().from(NOTIFICATION_LOGS_TABLE).insert({
				level: 'info',
				message,
				notification_id: notificationId,
				metadata: context,
			})

			if (error) throw error
		} catch (logError) {
			logger.error('[NotificationLogger] Failed to log info:', serializeLogError(logError))
		}
	}

	async logWarning({ notificationId, message, context }: LogWarningParams): Promise<void> {
		try {
			const { error } = await getSupabase().from(NOTIFICATION_LOGS_TABLE).insert({
				level: 'warning',
				message,
				notification_id: notificationId,
				metadata: context,
			})

			if (error) throw error
		} catch (logError) {
			logger.error('[NotificationLogger] Failed to log warning:', serializeLogError(logError))
		}
	}

	async getNotificationLogs(notificationId: string): Promise<NotificationLog[]> {
		try {
			const { data, error } = await getSupabase()
				.from(NOTIFICATION_LOGS_TABLE)
				.select('*')
				.eq('notification_id', notificationId)
				.order('created_at', { ascending: false })

			if (error) throw error
			return data || []
		} catch (error) {
			logger.error('[NotificationLogger] Failed to get notification logs:', error)
			return []
		}
	}

	async getErrorLogs(limit = 100, offset = 0): Promise<NotificationLog[]> {
		try {
			const { data, error } = await getSupabase()
				.from(NOTIFICATION_LOGS_TABLE)
				.select('*')
				.eq('level', 'error')
				.order('created_at', { ascending: false })
				.range(offset, offset + limit - 1)

			if (error) throw error
			return data || []
		} catch (error) {
			logger.error('[NotificationLogger] Failed to get error logs:', error)
			return []
		}
	}
}
