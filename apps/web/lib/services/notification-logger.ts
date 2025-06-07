import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

interface LogErrorParams {
	notificationId?: string
	message: string
	error: Error | unknown
	context?: Record<string, unknown>
}

interface LogInfoParams {
	notificationId?: string
	message: string
	context?: Record<string, unknown>
}

interface NotificationLog {
	id: string
	notification_id: string | null
	level: 'error' | 'info'
	message: string
	stack: string | null
	context: Record<string, unknown>
	created_at: string
}

export class NotificationLogger {
	async logError({
		notificationId,
		message,
		error,
		context = {},
	}: LogErrorParams): Promise<void> {
		try {
			await supabase.from('notification_logs').insert({
				notification_id: notificationId,
				level: 'error',
				message,
				stack: error instanceof Error ? error.stack : null,
				context: {
					...context,
					error: error instanceof Error ? error.message : String(error),
				},
			})
		} catch (err) {
			console.error('Failed to log error:', err)
		}
	}

	async logInfo({
		notificationId,
		message,
		context = {},
	}: LogInfoParams): Promise<void> {
		try {
			await supabase.from('notification_logs').insert({
				notification_id: notificationId,
				level: 'info',
				message,
				context,
			})
		} catch (err) {
			console.error('Failed to log info:', err)
		}
	}

	async getNotificationLogs(
		notificationId: string,
	): Promise<NotificationLog[]> {
		try {
			const { data: logs, error } = await supabase
				.from('notification_logs')
				.select('*')
				.eq('notification_id', notificationId)
				.order('created_at', { ascending: false })

			if (error) throw error
			return logs ?? []
		} catch (err) {
			console.error('Failed to fetch notification logs:', err)
			return []
		}
	}

	async getErrorLogs(limit = 100): Promise<NotificationLog[]> {
		try {
			const { data: logs, error } = await supabase
				.from('notification_logs')
				.select('*')
				.eq('level', 'error')
				.order('created_at', { ascending: false })
				.limit(limit)

			if (error) throw error
			return logs ?? []
		} catch (err) {
			console.error('Failed to fetch error logs:', err)
			return []
		}
	}
}
