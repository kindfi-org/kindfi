import { supabase } from '@packages/lib/supabase'
import { logger } from '..'

/**
 * Parameters for logging error events
 * @property {string} message - Error message to be logged
 * @property {unknown} error - The error object or message
 * @property {Record<string, unknown>} [context] - Optional additional context data
 * @property {string} [notificationId] - Optional ID of the related notification
 */
interface LogErrorParams {
	message: string
	error: unknown
	context?: Record<string, unknown>
	notificationId?: string
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

export type LogLevel = 'error' | 'info' | 'warning'

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
	level: LogLevel
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
			notification_id: params.notificationId,
			level: 'error',
			message: params.message,
			metadata: {
				...params.context,
				error:
					params.error instanceof Error
						? params.error.message
						: String(params.error),
				stack: params.error,
			},
		})
	} catch (logError) {
		logger.error({
			eventType: 'Log Error Failure',
			error: logError,
			details: logError,
		})
		throw params.error // Rethrow the original error after logging attempt
	}
		throw params.error // Rethrow the original error after logging attempt
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
	/**
	 * Logs an error event to the notification logs
	 * @param {LogErrorParams} params - Parameters for the error log
	 */
	async logError({
		message,
		error,
		context,
		notificationId,
	}: LogErrorParams): Promise<void> {
		try {
			const { error: dbError } = await supabase
				.from('notification_logs')
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
			logger.error({
				eventType: 'Log Error Failure',
				error: logError,
				details: logError,
			})
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
			const { error } = await supabase.from('notification_logs').insert({
				level: 'info',
				message: message,
				notification_id: notificationId,
				metadata: context,
			})

			if (error) throw error
		} catch (logError) {
			logger.error({
				eventType: 'Log Info Failure',
				error: logError,
				details: logError,
			})
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
			const { error } = await supabase.from('notification_logs').insert({
				level: 'warning',
				message: message,
				notification_id: notificationId,
				metadata: context,
			})

			if (error) throw error
		} catch (logError) {
			logger.error({
				eventType: 'Log Warning Failure',
				error: logError,
				details: logError,
			})
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
		try {
			const { data, error } = await supabase
				.from('notification_logs')
				.select('*')
				.eq('notification_id', notificationId)
				.order('created_at', { ascending: false })

			if (error) throw error
			return data || []
		} catch (error) {
			logger.error({
				eventType: 'Get Notification Logs Failure',
				error: error,
				details: error,
			})
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
			const { data, error } = await supabase
				.from('notification_logs')
				.select('*')
				.eq('level', 'error')
				.order('created_at', { ascending: false })
				.range(offset, offset + limit - 1)

			if (error) throw error
			return data || []
		} catch (error) {
			logger.error({
				eventType: 'Get Error Logs Failure',
				error: error,
				details: error,
			})
			return []
		}
	}
}
