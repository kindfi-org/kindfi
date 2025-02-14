export interface LoggerData {
	LogLevel: 'error' | 'warn' | 'info'

	LogData: {
		eventType: string
		[key: string]: unknown
	}
}

export interface ILogger {
	setMinLevel: (level: LoggerData['LogLevel']) => void
	error: (data: LoggerData['LogData']) => void
	warn: (data: LoggerData['LogData']) => void
	info: (data: LoggerData['LogData']) => void
}
