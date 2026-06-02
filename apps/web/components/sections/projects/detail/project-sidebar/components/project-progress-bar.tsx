'use client'

import { motion } from 'framer-motion'
import { progressBarAnimation } from '~/lib/constants/animations'

interface ProjectProgressBarProps {
	progressPercentage: number
	onChainRaised: number | null
	projectRaised: number
	isFetchingBalance: boolean
}

export function ProjectProgressBar({
	progressPercentage,
	onChainRaised,
	projectRaised,
	isFetchingBalance,
}: ProjectProgressBarProps) {
	return (
		<>
			<div
				className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2"
				role="progressbar"
				aria-valuenow={progressPercentage}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={`${progressPercentage}% funded`}
			>
				<motion.div
					className="h-full rounded-full gradient-progress"
					custom={progressPercentage}
					variants={progressBarAnimation}
					initial="initial"
					animate="animate"
				/>
			</div>

			<div className="flex justify-between mb-3 text-sm text-gray-500 tabular-nums">
				<span>
					{new Intl.NumberFormat(undefined, {
						style: 'currency',
						currency: 'USD',
						maximumFractionDigits: 0,
					}).format(onChainRaised ?? projectRaised)}{' '}
					raised
					{isFetchingBalance ? ' (Updating…)' : ''}
				</span>
				<span>{progressPercentage}%</span>
			</div>
		</>
	)
}
