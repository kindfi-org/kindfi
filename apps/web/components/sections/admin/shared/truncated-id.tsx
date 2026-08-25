import { cn } from '~/lib/utils'
import { CopyButton } from './copy-button'

interface TruncatedIdProps {
	value: string
	/** Accessible name for the copy control, e.g. "Copy contract address". */
	copyLabel?: string
	className?: string
}

function truncateMiddle(value: string, visible = 6): string {
	if (value.length <= visible * 2 + 1) return value
	return `${value.slice(0, visible)}…${value.slice(-visible)}`
}

/**
 * Middle-truncated identifier (contract address, tx hash, UUID) that never
 * breaks layouts. The full value stays available via `title` and the
 * optional copy control.
 */
export function TruncatedId({ value, copyLabel, className }: TruncatedIdProps) {
	return (
		<span className={cn('inline-flex min-w-0 items-center gap-1', className)}>
			<span className="truncate font-mono text-xs" title={value}>
				{truncateMiddle(value)}
			</span>
			{copyLabel ? <CopyButton value={value} label={copyLabel} /> : null}
		</span>
	)
}
