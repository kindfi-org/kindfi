import { AlertCircle } from 'lucide-react'
import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

interface ErrorStateProps {
	title: string
	description?: string
	retryLabel?: string
	onRetry?: () => void
	className?: string
}

export function ErrorState({
	title,
	description,
	retryLabel,
	onRetry,
	className,
}: ErrorStateProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50/50 py-8 text-center',
				className,
			)}
			role="alert"
		>
			<AlertCircle className="h-8 w-8 text-red-400" aria-hidden="true" />
			<div className="space-y-1">
				<p className="text-sm font-medium text-red-800">{title}</p>
				{description ? <p className="text-xs text-red-600">{description}</p> : null}
			</div>
			{retryLabel && onRetry ? (
				<Button variant="outline" size="sm" onClick={onRetry} className="mt-1 rounded-full">
					{retryLabel}
				</Button>
			) : null}
		</div>
	)
}
