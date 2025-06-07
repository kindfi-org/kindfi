import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

const supabase = createClient(
	env().NEXT_PUBLIC_SUPABASE_URL,
	env().NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

/**
 * Parameters for logging error events
 * @property {string} message - Error message to be logged
 * @property {unknown} error - The error object or message
 * @property {Record<string, unknown>} [context] - Optional additional context data
 */
interface LogErrorParams {
	message: string
	error: unknown
	context?: Record<string, unknown>
}

/**
 * Parameters for logging info events
 * @property {string} [notificationId] - Optional ID of the related notification
 * @property {string} message - Info message to be logged
 * @property {Record<string, unknown>} [context] - Optional additional context data
 */
interface LogInfoParams {
	notificationId?: string
	message: string
	context?: Record<string, unknown>
}

/**
 * Parameters for logging warning events
 * @property {string} [notificationId] - Optional ID of the related notification
 * @property {string} message - Warning message to be logged
 * @property {Record<string, unknown>} [context] - Optional additional context data
 */
interface LogWarningParams {
	notificationId?: string
	message: string
	context?: Record<string, unknown>
}

/**
 * Represents a notification log entry from the database
 * @property {string} id - Unique identifier for the log entry
 * @property {string | null} notification_id - ID of the related notification, if any
 * @property {'error' | 'info' | 'warning'} action - Log level indicating the type of entry
 * @property {string} message - The logged message
 * @property {Record<string, unknown>} [metadata] - Additional context data
 * @property {string} created_at - Timestamp of when the log was created
 */
interface NotificationLog {
	id: string
	notification_id: string | null
	action: 'error' | 'info' | 'warning'
	message: string
	metadata?: Record<string, unknown>
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
			action: 'error',
			message: params.message,
			metadata: {
				...params.context,
				error:
					params.error instanceof Error
						? params.error.message
						: String(params.error),
				stack: params.error instanceof Error ? params.error.stack : undefined,
			},
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
export async function getNotificationLogs(
	notificationId: string,
): Promise<LogResult<NotificationLog[]>> {
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
			error:
				error instanceof Error ? error : new Error('Unknown error occurred'),
		}
	}
}

/**
 * Retrieves recent logs with pagination support
 * @param {number} [limit=100] - Maximum number of logs to retrieve
 * @param {number} [offset=0] - Number of logs to skip
 * @returns {Promise<LogResult<NotificationLog[]>>} Array of logs or error
 */
export async function getRecentLogs(
	limit = 100,
	offset = 0,
): Promise<LogResult<NotificationLog[]>> {
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
			error:
				error instanceof Error ? error : new Error('Unknown error occurred'),
		}
	}
}

export class NotificationLogger {
	private supabase: ReturnType<typeof createClient>

	constructor(supabaseClient?: ReturnType<typeof createClient>) {
		this.supabase =
			supabaseClient ||
			createClient(
				env().NEXT_PUBLIC_SUPABASE_URL,
				env().NEXT_PUBLIC_SUPABASE_ANON_KEY,
			)
	}

	/**
	 * Logs an error event to the notification logs
	 * @param {LogErrorParams} params - Parameters for the error log
	 */
	async logError({ message, error, context }: LogErrorParams): Promise<void> {
		try {
			const { error: dbError } = await this.supabase.from('notification_logs').insert({
				action: 'error',
				message,
				metadata: {
					...context,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			})
			
			if (dbError) throw dbError
		} catch (logError) {
			console.error('Failed to log error:', logError)
			// Don't throw to avoid disrupting the main flow
		}
	}

	/**
	 * Logs an informational event to the notification logs
	 * @param {LogInfoParams} params - Parameters for the info log
	 */
	async logInfo({
		notificationId,
		message,
		context,
	}: LogInfoParams): Promise<void> {
		try {
			const { error: dbError } = await this.supabase.from('notification_logs').insert({
				notification_id: notificationId,
				action: 'info',
				message,
				metadata: context,
			})
			
			if (dbError) throw dbError
		} catch (logError) {
			console.error('Failed to log info:', logError)
			// Don't throw to avoid disrupting the main flow
		}
	}

	/**
	 * Logs a warning event to the notification logs
	 * @param {LogWarningParams} params - Parameters for the warning log
	 */
	async logWarning({
		notificationId,
		message,
		context,
	}: LogWarningParams): Promise<void> {
		try {
			const { error: dbError } = await this.supabase.from('notification_logs').insert({
				notification_id: notificationId,
				action: 'warning',
				message,
				metadata: context,
			})
			
			if (dbError) throw dbError
		} catch (logError) {
			console.error('Failed to log warning:', logError)
			// Don't throw to avoid disrupting the main flow
		}
	}

	/**
	 * Retrieves logs for a specific notification
	 * @param {string} notificationId - ID of the notification to fetch logs for
	 * @returns {Promise<NotificationLog[]>} Array of logs
	 */
	async getNotificationLogs(
		notificationId: string,
	): Promise<NotificationLog[]> {
		const { data, error } = await this.supabase
			.from('notification_logs')
			.select('*')
			.eq('notification_id', notificationId)
			.order('created_at', { ascending: false })

		if (error) {
			throw new Error(`Failed to get notification logs: ${error.message}`)
		}

		return (data ?? []).map((log) => ({
			id: log.id,
			notification_id: log.notification_id,
			action: log.action,
			message: log.message,
			metadata: log.metadata,
			created_at: log.created_at,
		})) as NotificationLog[]
	}

	/**
	 * Retrieves error logs with pagination support
	 * @param {number} [limit=100] - Maximum number of logs to retrieve
	 * @param {number} [offset=0] - Number of logs to skip
	 * @returns {Promise<NotificationLog[]>} Array of error logs
	 */
	async getErrorLogs(limit = 100, offset = 0): Promise<NotificationLog[]> {
		const { data, error } = await this.supabase
			.from('notification_logs')
			.select('*')
			.eq('action', 'error')
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1)

		if (error) {
			throw new Error(`Failed to get error logs: ${error.message}`)
		}

		return (data ?? []).map((log) => ({
			id: log.id,
			notification_id: log.notification_id,
			action: log.action,
			message: log.message,
			metadata: log.metadata,
			created_at: log.created_at,
		})) as NotificationLog[]
	}
}
