export type LogLevel = 'error' | 'info' | 'warning'

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
 * Client-safe notification logger. Persistence is handled server-side only
 * via notification-logger.server.ts to avoid RLS issues and leaking credentials.
 */
export class NotificationLogger {
	async logError(_params: LogErrorParams): Promise<void> {}

	async logInfo(_params: LogInfoParams): Promise<void> {}

	async logWarning(_params: LogWarningParams): Promise<void> {}

	async getNotificationLogs(_notificationId: string): Promise<NotificationLog[]> {
		return []
	}

	async getErrorLogs(_limit = 100, _offset = 0): Promise<NotificationLog[]> {
		return []
	}
}

export async function logError(_params: LogErrorParams): Promise<void> {}

export async function getNotificationLogs(
	_notificationId: string,
): Promise<LogResult<NotificationLog[]>> {
	return { data: [], error: null }
}

export async function getRecentLogs(
	_limit = 100,
	_offset = 0,
): Promise<LogResult<NotificationLog[]>> {
	return { data: [], error: null }
}
