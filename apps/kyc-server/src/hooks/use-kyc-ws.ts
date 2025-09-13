import { useCallback, useEffect, useRef, useState } from 'react'

interface UseKYCWebSocketOptions {
	onUpdate?: (update: any) => void
	maxRetries?: number
}

const isValidUpdate = (data: any) => {
	return data && data.type === 'kyc_update'
}

export function useKYCWebSocket({
	onUpdate,
	maxRetries = 3,
}: UseKYCWebSocketOptions = {}) {
	const [isConnected, setIsConnected] = useState(false)
	const wsRef = useRef(null)
	const retryCount = useRef(0)
	const retryTimeout = useRef(undefined)
	const onUpdateRef = useRef(onUpdate)

	useEffect(() => {
		onUpdateRef.current = onUpdate
	}, [onUpdate])

	const connect = useCallback(() => {
		const ws = new WebSocket(`ws://${window.location.host}/live`)
		wsRef.current = ws

		ws.onopen = () => {
			console.log('WebSocket connected')
			setIsConnected(true)
			retryCount.current = 0
		}

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				if (isValidUpdate(data)) {
					onUpdateRef.current?.(data)
				} else if (data.type === 'error') {
					console.log('WS error:', data.message)
				}
			} catch (err) {
				console.log('WS parse error')
			}
		}

		ws.onclose = () => {
			console.log('WebSocket disconnected')
			setIsConnected(false)

			if (retryCount.current < maxRetries) {
				retryTimeout.current = setTimeout(() => {
					retryCount.current++
					connect()
				}, 2000)
			}
		}

		ws.onerror = () => {
			console.log('WebSocket error')
			setIsConnected(false)
		}
	}, [maxRetries])

	useEffect(() => {
		connect()

		return () => {
			if (retryTimeout.current) {
				clearTimeout(retryTimeout.current)
			}
			if (wsRef.current) {
				wsRef.current.close()
			}
		}
	}, [connect])

	return {
		isConnected,
		reconnect: () => {
			retryCount.current = 0
			if (wsRef.current) {
				wsRef.current.close()
			} else {
				connect()
			}
		},
	}
}
