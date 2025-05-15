import { useEffect, useRef, useState } from 'react'

interface KYCUpdate {
	type: 'kyc_update'
	userId: string
	status: string
	timestamp: string
}

interface UseKYCWebSocketOptions {
	userId?: string
	onUpdate?: (update: KYCUpdate) => void
	maxRetries?: number
	initialRetryDelay?: number
}

export function useKYCWebSocket({
	userId,
	onUpdate,
	maxRetries = 5,
	initialRetryDelay = 1000,
}: UseKYCWebSocketOptions = {}) {
	const [isConnected, setIsConnected] = useState(false)
	const lastUpdateRef = useRef<KYCUpdate | null>(null)
	const wsRef = useRef<WebSocket | null>(null)
	const retryCountRef = useRef(0)
	const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

	const connect = () => {
		const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws'
		const ws = new WebSocket(`${protocol}://${window.location.host}/live`)
		wsRef.current = ws

		ws.onopen = () => {
			console.log('WebSocket connected')
			setIsConnected(true)
			retryCountRef.current = 0

			if (userId) {
				ws.send(JSON.stringify({ type: 'subscribe', userId }))
			}
		}

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				if (data && typeof data === 'object' && data.type === 'kyc_update') {
					const update = data as KYCUpdate
					lastUpdateRef.current = update
					onUpdate?.(update)
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error)
			}
		}

		ws.onclose = () => {
			console.log('WebSocket disconnected')
			setIsConnected(false)

			// Attempt to reconnect with exponential backoff
			if (retryCountRef.current < maxRetries) {
				const delay = initialRetryDelay * Math.pow(2, retryCountRef.current)
				retryTimeoutRef.current = setTimeout(() => {
					retryCountRef.current++
					connect()
				}, delay)
			}
		}

		ws.onerror = (error) => {
			console.error('WebSocket error:', error)
			setIsConnected(false)
		}
	}

	useEffect(() => {
		connect()

		return () => {
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current)
			}
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.close()
			}
		}
	}, [userId, onUpdate, maxRetries, initialRetryDelay])

	return {
		isConnected,
		lastUpdate: lastUpdateRef.current,
		sendMessage: <T extends Record<string, any>>(message: T) => {
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.send(JSON.stringify(message))
			}
		},
		reconnect: () => {
			retryCountRef.current = 0
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.close()
			} else {
				connect()
			}
		},
	}
} 