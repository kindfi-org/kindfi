'use client'

import { useReflectorPrice } from '~/hooks/use-reflector-price'
import { cn } from '~/lib/utils'

interface ReflectorQuoteProps {
	amount: number | string | null | undefined
	asset?: string
	className?: string
}

export function ReflectorQuote({ amount, asset = 'XLM', className }: ReflectorQuoteProps) {
	const { quote } = useReflectorPrice(asset)

	if (!quote || asset.toUpperCase() !== 'XLM' || amount === null || amount === undefined) {
		return null
	}

	const numericAmount = typeof amount === 'number' ? amount : Number(amount)
	if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
		return null
	}

	const fiatValue = numericAmount * quote.price
	const formattedFiat = fiatValue.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})

	const quoteTimeMs =
		typeof quote.timestamp === 'number'
			? quote.timestamp < 1e11
				? quote.timestamp * 1000
				: quote.timestamp
			: Date.parse(String(quote.timestamp))

	const quoteDate = new Date(quoteTimeMs)
	const isValidDate = !Number.isNaN(quoteDate.getTime())
	const formattedTime = isValidDate
		? quoteDate.toLocaleTimeString(undefined, {
				hour: 'numeric',
				minute: '2-digit',
			})
		: String(quote.timestamp)

	const isoTimestamp = isValidDate ? quoteDate.toISOString() : String(quote.timestamp)

	return (
		<span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}>
			<span>About ${formattedFiat} USD · Reflector Pulse</span>
			{isValidDate ? (
				<span className="opacity-75">
					(as of <time dateTime={isoTimestamp}>{formattedTime}</time>)
				</span>
			) : null}
		</span>
	)
}
