import { Info } from 'lucide-react'
import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

interface PrerequisiteNoticeProps {
	message: string
	actionLabel?: string
	onAction?: () => void
	variant?: 'info' | 'warning'
	className?: string
}

const variantStyles = {
	info: 'border-blue-100 bg-blue-50/60 text-blue-800',
	warning: 'border-amber-200 bg-amber-50 text-amber-900',
}

export function PrerequisiteNotice({
	message,
	actionLabel,
	onAction,
	variant = 'info',
	className,
}: PrerequisiteNoticeProps) {
	return (
		<div
			className={cn(
				'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
				variantStyles[variant],
				className,
			)}
			role="note"
		>
			<Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
			<span className="flex-1 leading-relaxed">{message}</span>
			{actionLabel && onAction ? (
				<Button
					variant="outline"
					size="sm"
					onClick={onAction}
					className="shrink-0 rounded-full border-current text-xs"
				>
					{actionLabel}
				</Button>
			) : null}
		</div>
	)
}
