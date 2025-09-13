import { useEffect, useRef, useState } from 'react'

interface KYCUpdate {
	type: 'kyc_status'
	data: {
		user_id: string
		status: string
		verification_level: string
		timestamp: string
	}
}

interface UseKYCWebSocketOptions {
	onUpdate?: (update: KYCUpdate) => void
}

const isValidUpdate = (data: unknown): data is KYCUpdate => {
	return typeof data === 'object' && data !== null && 
		   'type' in data && (data as KYCUpdate).type === 'kyc_status'
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

	private connect() {
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
							console.log('WS error:', data.message)
						}
					} catch {
						console.log('WS parse error')
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

				this.ws.onerror = () => {
					console.log('WebSocket error (singleton)')
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

	reconnect() {
		this.retryCount = 0
		this.disconnect()
		if (this.subscribers.size > 0) {
			this.connect()
		}
	}
}

const wsManager = new WebSocketManager()

export function useKYCWebSocket({
	onUpdate,
}: UseKYCWebSocketOptions = {}) {
	const [isConnected, setIsConnected] = useState(false)
	const onUpdateRef = useRef(onUpdate)

	useEffect(() => {
		onUpdateRef.current = onUpdate
	}, [onUpdate])

	useEffect(() => {
		const unsubscribe = wsManager.subscribe((update) => {
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
		reconnect: () => {
			wsManager.reconnect()
		},
	}
}
