import { useEffect, useRef, useState } from 'react'

import { type KYCUpdate, kycUpdateSchema } from '~/lib/validation/kyc-schemas'

interface UseKYCWebSocketOptions {
	onUpdate?: (update: KYCUpdate) => void
	maxRetries?: number
	url?: string
}

const isValidUpdate = (data: unknown): data is KYCUpdate => {
	try {
		kycUpdateSchema.parse(data)
		return true
	} catch {
		return false
	}
}

export function useKYCWebSocket({
	onUpdate,
	maxRetries = 3,
	url,
}: UseKYCWebSocketOptions = {}) {
	const [isConnected, setIsConnected] = useState(false)
	const [lastUpdate, setLastUpdate] = useState<KYCUpdate | null>(null)
	const wsRef = useRef<WebSocket | null>(null)
	const onUpdateRef = useRef(onUpdate)
	const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const retryCount = useRef(0)
	const wsUrl = url || `ws://${window.location.host}/live`

	useEffect(() => {
		onUpdateRef.current = onUpdate
	}, [onUpdate])

	useEffect(() => {
		let mounted = true

		const connect = () => {
			if (!mounted) return

			try {
				const ws = new WebSocket(wsUrl)
				wsRef.current = ws

				ws.onopen = () => {
					if (!mounted) return
					console.log('WebSocket connected')
					setIsConnected(true)
					retryCount.current = 0
				}

				ws.onmessage = (event) => {
					if (!mounted) return
					try {
						const data = JSON.parse(event.data)
						if (isValidUpdate(data)) {
							setLastUpdate(data)
							onUpdateRef.current?.(data)
						} else if (
							data &&
							typeof data === 'object' &&
							'type' in data &&
							data.type === 'error'
						) {
							console.error('WebSocket received error:', data)
						}
					} catch (err) {
						console.error('WebSocket message parse failed:', err)
					}
				}

				ws.onclose = () => {
					if (!mounted) return
					console.log('WebSocket disconnected')
					setIsConnected(false)
					wsRef.current = null

					if (retryCount.current < maxRetries) {
						retryTimeoutRef.current = setTimeout(() => {
							retryCount.current++
							connect()
						}, 2000)
					}
				}

				ws.onerror = (error) => {
					console.error('WebSocket connection error:', error)
					setIsConnected(false)
				}
			} catch (error) {
				console.error('Failed to create WebSocket:', error)
				setIsConnected(false)
			}
		}

		connect()

		return () => {
			mounted = false
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current)
				retryTimeoutRef.current = null
			}
			if (wsRef.current) {
				wsRef.current.close()
				wsRef.current = null
			}
		}
	}, [wsUrl, maxRetries])

	return {
		isConnected,
		lastUpdate,
		sendMessage: (message: Record<string, unknown>) => {
			if (wsRef.current && isConnected) {
				wsRef.current.send(JSON.stringify(message))
			}
		},
		reconnect: () => {
			retryCount.current = 0
			if (wsRef.current) {
				wsRef.current.close()
			}
		},
	}
}
