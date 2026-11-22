'use client'

import { useEffect, useState } from 'react'

export interface ReflectorPriceQuote {
	asset: string
	price: number
	timestamp: string | number
}

export function useReflectorPrice(asset = 'XLM') {
	const [quote, setQuote] = useState<ReflectorPriceQuote | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		let isMounted = true

		if (asset !== 'XLM') {
			setQuote(null)
			setIsLoading(false)
			return
		}

		async function fetchPrice() {
			try {
				const response = await fetch(`/api/prices?asset=${encodeURIComponent(asset)}`)
				if (!response.ok) {
					if (isMounted) setQuote(null)
					return
				}

				const data = await response.json()
				if (isMounted) {
					// Render the fiat line only when status is absent and price is present
					if (
						data &&
						typeof data.price === 'number' &&
						Number.isFinite(data.price) &&
						!data.status &&
						data.timestamp
					) {
						setQuote({
							asset: data.asset ?? 'XLM',
							price: data.price,
							timestamp: data.timestamp,
						})
					} else {
						setQuote(null)
					}
				}
			} catch {
				if (isMounted) setQuote(null)
			} finally {
				if (isMounted) setIsLoading(false)
			}
		}

		fetchPrice()

		return () => {
			isMounted = false
		}
	}, [asset])

	return { quote, isLoading }
}
