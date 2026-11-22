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

	const quoteDate = new Date(quote.timestamp)
	const isValidDate = !Number.isNaN(quoteDate.getTime())
	const formattedTime = isValidDate
		? quoteDate.toLocaleTimeString(undefined, {
				hour: 'numeric',
				minute: '2-digit',
			})
		: quote.timestamp

	return (
		<span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}>
			<span>About ${formattedFiat} USD · Reflector Pulse</span>
			{isValidDate ? (
				<span className="opacity-75">
					(as of <time dateTime={quote.timestamp}>{formattedTime}</time>)
				</span>
			) : null}
		</span>
	)
}
