import { cn } from '~/lib/utils'

interface ProgressBarProps {
	percentage: number
	showLabel?: boolean
	size?: 'sm' | 'lg'
}

export function ProgressBar({
	percentage,
	showLabel = true,
	size = 'lg',
}: ProgressBarProps) {
	// Ensure percentage is between 0 and 100
	const validPercentage = Math.min(Math.max(percentage, 0), 100)

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-4">
				<div
					className={cn(
						'relative h-2 w-full overflow-hidden rounded-full bg-slate-200',
						size === 'sm' && 'h-1',
					)}
				>
					<div
						className="absolute left-0 top-0 h-full rounded-full bg-green-500"
						style={{ width: `${validPercentage}%` }}
					/>
				</div>

				{showLabel && (
					<span className="whitespace-nowrap text-sm font-medium text-slate-700">
						{validPercentage}% Complete
					</span>
				)}
			</div>
		</div>
	)
}
