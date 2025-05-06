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
}

export function useKYCWebSocket({
	userId,
	onUpdate,
}: UseKYCWebSocketOptions = {}) {
	const [isConnected, setIsConnected] = useState(false)
	const [lastUpdate, setLastUpdate] = useState<KYCUpdate | null>(null)
	const wsRef = useRef<WebSocket | null>(null)

	useEffect(() => {
		const ws = new WebSocket(`ws://${window.location.host}/live`)
		wsRef.current = ws

		ws.onopen = () => {
			console.log('WebSocket connected')
			setIsConnected(true)

			if (userId) {
				ws.send(JSON.stringify({ type: 'set_user_id', userId }))
			}
		}

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data) as KYCUpdate
				if (data.type === 'kyc_update') {
					setLastUpdate(data)
					onUpdate?.(data)
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error)
			}
		}

		ws.onclose = () => {
			console.log('WebSocket disconnected')
			setIsConnected(false)
		}

		ws.onerror = (error) => {
			console.error('WebSocket error:', error)
			setIsConnected(false)
		}

		return () => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.close()
			}
		}
	}, [userId, onUpdate])

	return {
		isConnected,
		lastUpdate,
		sendMessage: (message: unknown) => {
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.send(JSON.stringify(message))
			}
		},
	}
}
