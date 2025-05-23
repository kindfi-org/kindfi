import { useCallback, useEffect, useRef, useState } from 'react'

interface KYCUpdate {
	type: 'kyc_update'
	userId: string
	status: string
	timestamp: string
}

interface WebSocketError {
	type: 'error'
	message: string
}

type WebSocketMessage = KYCUpdate | WebSocketError

interface UseKYCWebSocketOptions {
	userId?: string
	onUpdate?: (update: KYCUpdate) => void
	maxRetries?: number
	initialRetryDelay?: number
	connectionTimeout?: number
}

const isValidKYCUpdate = (data: unknown): data is KYCUpdate => {
	return (
		typeof data === 'object' &&
		data !== null &&
		'type' in data &&
		data.type === 'kyc_update' &&
		'userId' in data &&
		typeof data.userId === 'string' &&
		'status' in data &&
		typeof data.status === 'string' &&
		'timestamp' in data &&
		typeof data.timestamp === 'string'
	)
}

export function useKYCWebSocket({
	userId,
	onUpdate,
	maxRetries = 5,
	initialRetryDelay = 1000,
	connectionTimeout = 10000,
}: UseKYCWebSocketOptions = {}) {
	const [isConnected, setIsConnected] = useState(false)
	const lastUpdateRef = useRef<KYCUpdate | null>(null)
	const wsRef = useRef<WebSocket | null>(null)
	const retryCountRef = useRef(0)
	const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
	const connectionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
	const onUpdateRef = useRef(onUpdate)

	useEffect(() => {
		onUpdateRef.current = onUpdate
	}, [onUpdate])

	const connect = useCallback(() => {
		const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws'
		const ws = new WebSocket(`${protocol}://${window.location.host}/live`)
		wsRef.current = ws

		connectionTimeoutRef.current = setTimeout(() => {
			if (ws.readyState !== WebSocket.OPEN) {
				console.log('WebSocket connection timed out')
				ws.close()
			}
		}, connectionTimeout)

		ws.onopen = () => {
			console.log('WebSocket connected')
			setIsConnected(true)
			retryCountRef.current = 0
			clearTimeout(connectionTimeoutRef.current)

			if (userId) {
				ws.send(JSON.stringify({ type: 'subscribe', userId }))
			}
		}

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data) as WebSocketMessage

				if (isValidKYCUpdate(data)) {
					lastUpdateRef.current = data
					onUpdateRef.current?.(data)
				} else if (
					data &&
					typeof data === 'object' &&
					'type' in data &&
					data.type === 'error'
				) {
					console.error('Server error:', (data as WebSocketError).message)
				} else {
					console.warn('Received unknown message format:', data)
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error)
			}
		}

		ws.onclose = () => {
			console.log('WebSocket disconnected')
			setIsConnected(false)
			clearTimeout(connectionTimeoutRef.current)

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
	}, [userId, maxRetries, initialRetryDelay, connectionTimeout])

	useEffect(() => {
		connect()

		return () => {
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current)
			}
			if (connectionTimeoutRef.current) {
				clearTimeout(connectionTimeoutRef.current)
			}
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.close()
			}
		}
	}, [connect])

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
