export type TriggerResponse = {
	success: boolean
	module?: string
	action?: string
	txHash?: string
	explorerUrl?: string
	error?: string
	data?: Record<string, unknown>
}
