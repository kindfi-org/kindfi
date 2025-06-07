import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

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

export interface LogResult<T> {
	data: T | null
	error: Error | null
}

export async function logError(notificationId: string, error: Error, context?: Record<string, unknown>): Promise<void> {
	try {
		await supabase.from('notification_logs').insert({
			notification_id: notificationId,
			level: 'error',
			message: error.message,
			stack: error.stack,
			context: context || {}
		})
	} catch (logError) {
		console.error('Failed to log error:', logError)
		throw error // Rethrow the original error after logging attempt
	}
}

export async function getNotificationLogs(notificationId: string): Promise<LogResult<NotificationLog[]>> {
	try {
		const { data, error } = await supabase
			.from('notification_logs')
			.select('*')
			.eq('notification_id', notificationId)
			.order('created_at', { ascending: false })

		if (error) throw error
		return { data, error: null }
	} catch (error) {
		return { 
			data: null, 
			error: error instanceof Error ? error : new Error('Unknown error occurred') 
		}
	}
}

export async function getRecentLogs(limit = 100): Promise<LogResult<NotificationLog[]>> {
	try {
		const { data, error } = await supabase
			.from('notification_logs')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(limit)

		if (error) throw error
		return { data, error: null }
	} catch (error) {
		return { 
			data: null, 
			error: error instanceof Error ? error : new Error('Unknown error occurred') 
		}
	}
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
