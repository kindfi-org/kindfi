import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

const supabase = createClient(env().NEXT_PUBLIC_SUPABASE_URL, env().NEXT_PUBLIC_SUPABASE_ANON_KEY)

/**
 * Parameters for logging error events with optional notification context
 * @property {string} [notificationId] - Optional ID of the related notification
 * @property {string} message - Error message to be logged
 * @property {Error | unknown} error - The error object or value to be logged
 * @property {Record<string, unknown>} [context] - Optional additional context data
 */
interface LogErrorParams {
	notificationId?: string
	message: string
	error: Error | unknown
	context?: Record<string, unknown>
}

/**
 * Parameters for logging informational events
 * @property {string} [notificationId] - Optional ID of the related notification
 * @property {string} message - Informational message to be logged
 * @property {Record<string, unknown>} [context] - Optional additional context data
 */
interface LogInfoParams {
	notificationId?: string
	message: string
	context?: Record<string, unknown>
}

/**
 * Represents a notification log entry from the database
 * @property {string} id - Unique identifier for the log entry
 * @property {string | null} notification_id - ID of the related notification, if any
 * @property {'error' | 'info'} level - Log level indicating the type of entry
 * @property {string} message - The logged message
 * @property {string | null} stack - Error stack trace for error logs
 * @property {Record<string, unknown>} context - Additional context data
 * @property {string} created_at - Timestamp of when the log was created
 */
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

/**
 * Logs an error event to the notification logs
 * @param {LogErrorParams} params - Parameters for the error log
 * @throws {Error} Re-throws the original error after logging attempt
 */
export async function logError(params: LogErrorParams): Promise<void> {
	try {
		await supabase.from('notification_logs').insert({
			notification_id: params.notificationId,
			level: 'error',
			message: params.message,
			stack: params.error instanceof Error ? params.error.stack : null,
			context: params.context || {}
		})
	} catch (logError) {
		console.error('Failed to log error:', logError)
		throw params.error // Rethrow the original error after logging attempt
	}
}

/**
 * Retrieves logs for a specific notification
 * @param {string} notificationId - ID of the notification to fetch logs for
 * @returns {Promise<LogResult<NotificationLog[]>>} Array of logs or error
 */
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

/**
 * Retrieves recent logs with pagination support
 * @param {number} [limit=100] - Maximum number of logs to retrieve
 * @param {number} [offset=0] - Number of logs to skip
 * @returns {Promise<LogResult<NotificationLog[]>>} Array of logs or error
 */
export async function getRecentLogs(limit = 100, offset = 0): Promise<LogResult<NotificationLog[]>> {
	try {
		const { data, error } = await supabase
			.from('notification_logs')
			.select('*')
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1)

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
	/**
	 * Logs an error event to the notification logs
	 * @param {LogErrorParams} params - Parameters for the error log
	 */
	async logError(params: LogErrorParams): Promise<void> {
		try {
			await supabase.from('notification_logs').insert({
				notification_id: params.notificationId,
				level: 'error',
				message: params.message,
				stack: params.error instanceof Error ? params.error.stack : null,
				context: {
					...params.context,
					error: params.error instanceof Error ? params.error.message : String(params.error),
				},
			})
		} catch (err) {
			console.error('Failed to log error:', err)
		}
	}

	/**
	 * Logs an informational event to the notification logs
	 * @param {LogInfoParams} params - Parameters for the info log
	 */
	async logInfo(params: LogInfoParams): Promise<void> {
		try {
			await supabase.from('notification_logs').insert({
				notification_id: params.notificationId,
				level: 'info',
				message: params.message,
				context: params.context,
			})
		} catch (err) {
			console.error('Failed to log info:', err)
		}
	}

	/**
	 * Retrieves logs for a specific notification
	 * @param {string} notificationId - ID of the notification to fetch logs for
	 * @returns {Promise<NotificationLog[]>} Array of logs
	 */
	async getNotificationLogs(notificationId: string): Promise<NotificationLog[]> {
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

	/**
	 * Retrieves error logs with pagination support
	 * @param {number} [limit=100] - Maximum number of logs to retrieve
	 * @param {number} [offset=0] - Number of logs to skip
	 * @returns {Promise<NotificationLog[]>} Array of error logs
	 */
	async getErrorLogs(limit = 100, offset = 0): Promise<NotificationLog[]> {
		try {
			const { data: logs, error } = await supabase
				.from('notification_logs')
				.select('*')
				.eq('level', 'error')
				.order('created_at', { ascending: false })
				.range(offset, offset + limit - 1)

			if (error) throw error
			return logs ?? []
		} catch (err) {
			console.error('Failed to fetch error logs:', err)
			return []
		}
	}
}
