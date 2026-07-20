/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: matches existing progress bars */
'use client'

import { motion } from 'framer-motion'
import { progressBarAnimation } from '~/lib/constants/animations'
import { cn } from '~/lib/utils'

interface ReleasedProgressBarProps {
	/** Cumulative amount released via milestones with `released` status. */
	releasedAmount: number
	/** Released amount as a percent of goal (0–100). */
	progressPercentage: number
	className?: string
}

const releasedFormatter = new Intl.NumberFormat(undefined, {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0,
})

/**
 * Second progress bar showing funds already released from escrow to
 * beneficiaries. Visually distinct from the "Funds Raised" bar (teal fill)
 * while keeping the same shape and animation.
 */
export function ReleasedProgressBar({
	releasedAmount,
	progressPercentage,
	className,
}: ReleasedProgressBarProps) {
	return (
		<div className={cn('w-full', className)}>
			<div
				className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2"
				role="progressbar"
				aria-valuenow={progressPercentage}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={`${progressPercentage}% released`}
			>
				<motion.div
					className="h-full rounded-full gradient-released"
					custom={progressPercentage}
					variants={progressBarAnimation}
					initial="initial"
					animate="animate"
				/>
			</div>

			<div className="flex justify-between mt-1 text-sm text-gray-500 tabular-nums">
				<span>{releasedFormatter.format(releasedAmount)} released</span>
				<span>{progressPercentage}%</span>
			</div>
		</div>
	)
}
