import { useEffect, useRef, useState } from 'react'

import type { Enums } from '@services/supabase'

interface KYCUpdate {
	type: 'kyc_status'
	data: {
		user_id: string
		status: Enums<'kyc_status_enum'>
		verification_level: string
		timestamp: string
	}
}

interface UseKYCWebSocketOptions {
	onUpdate?: (update: KYCUpdate) => void
}

const isValidUpdate = (data: unknown): data is KYCUpdate => {
	if (typeof data !== 'object' || data === null) {
		return false
	}

	const obj = data as Record<string, unknown>
	
	// Check for type property
	if (!('type' in obj) || obj.type !== 'kyc_status') {
		return false
	}

	// Check for data property and its structure
	if (!('data' in obj) || typeof obj.data !== 'object' || obj.data === null) {
		return false
	}

	const payload = obj.data as Record<string, unknown>
	
	// Validate required payload properties
	return (
		typeof payload.user_id === 'string' &&
		typeof payload.status === 'string' &&
		['pending', 'approved', 'rejected', 'verified'].includes(payload.status) &&
		typeof payload.verification_level === 'string' &&
		typeof payload.timestamp === 'string'
	)
}

// Singleton WebSocket connection manager
class WebSocketManager {
	private ws: WebSocket | null = null
	private subscribers: Set<(update: KYCUpdate) => void> = new Set()
	private connectionPromise: Promise<void> | null = null
	private isConnected = false
	private retryCount = 0
	private maxRetries = 3
	private retryTimeout: NodeJS.Timeout | null = null

	subscribe(callback: (update: KYCUpdate) => void) {
		this.subscribers.add(callback)
		if (!this.ws && !this.connectionPromise) {
			this.connect()
		}
		return () => this.unsubscribe(callback)
	}

	unsubscribe(callback: (update: KYCUpdate) => void) {
		this.subscribers.delete(callback)
		if (this.subscribers.size === 0) {
			this.disconnect()
		}
	}

	private connect(): Promise<void> {
		if (this.connectionPromise) return this.connectionPromise

		this.connectionPromise = new Promise<void>((resolve, reject) => {
			try {
				this.ws = new WebSocket(`ws://${window.location.host}/live`)

				this.ws.onopen = () => {
					console.log('WebSocket connected (singleton)')
					this.isConnected = true
					this.retryCount = 0
					this.connectionPromise = null
					resolve()
				}

				this.ws.onmessage = (event) => {
					try {
						const data = JSON.parse(event.data)
						if (isValidUpdate(data)) {
							this.subscribers.forEach(callback => {
								callback(data)
							})
						} else if (data && typeof data === 'object' && 'type' in data && data.type === 'error' && 'message' in data) {
							console.error('WebSocket received error message:', {
								message: data.message,
								payload: data,
								context: 'ws_error_message'
							})
						}
					} catch (err) {
						console.error('WebSocket message parse failed:', {
							error: err,
							rawMessage: event.data,
							context: 'ws_parse_error'
						})
					}
				}

				this.ws.onclose = () => {
					console.log('WebSocket disconnected (singleton)')
					this.isConnected = false
					this.ws = null
					this.connectionPromise = null

					if (this.subscribers.size > 0 && this.retryCount < this.maxRetries) {
						this.retryTimeout = setTimeout(() => {
							this.retryCount++
							this.connect()
						}, 2000)
					}
				}

				this.ws.onerror = (event) => {
					console.error('WebSocket connection error:', {
						event,
						context: 'ws_connection_error',
						retryCount: this.retryCount,
						maxRetries: this.maxRetries
					})
					this.isConnected = false
					this.connectionPromise = null
					reject(new Error('WebSocket connection failed'))
				}
			} catch (error) {
				this.connectionPromise = null
				reject(error)
			}
		})

		return this.connectionPromise
	}

	private disconnect() {
		if (this.retryTimeout) {
			clearTimeout(this.retryTimeout)
			this.retryTimeout = null
		}
		if (this.ws) {
			this.ws.close()
			this.ws = null
		}
		this.isConnected = false
		this.connectionPromise = null
	}

	getConnectionStatus() {
		return this.isConnected
	}

	reconnect(): void {
		this.retryCount = 0
		this.disconnect()
		if (this.subscribers.size > 0) {
			this.connect()
		}
	}

	sendMessage(message: any): void {
		if (this.ws && this.isConnected) {
			this.ws.send(JSON.stringify(message))
		}
	}
}

const wsManager = new WebSocketManager()

export function useKYCWebSocket({
	onUpdate,
}: UseKYCWebSocketOptions = {}) {
	const [isConnected, setIsConnected] = useState(false)
	const [lastUpdate, setLastUpdate] = useState<KYCUpdate | null>(null)
	const onUpdateRef = useRef(onUpdate)

	useEffect(() => {
		onUpdateRef.current = onUpdate
	}, [onUpdate])

	useEffect(() => {
		const unsubscribe = wsManager.subscribe((update) => {
			setLastUpdate(update)
			onUpdateRef.current?.(update)
		})

		// Update connection status
		const checkStatus = () => {
			setIsConnected(wsManager.getConnectionStatus())
		}

		checkStatus()
		const statusInterval = setInterval(checkStatus, 1000)

		return () => {
			clearInterval(statusInterval)
			unsubscribe()
		}
	}, [])

	return {
		isConnected,
		lastUpdate,
		sendMessage: (message: any) => {
			wsManager.sendMessage(message)
		},
		reconnect: () => {
			wsManager.reconnect()
		},
	}
}
