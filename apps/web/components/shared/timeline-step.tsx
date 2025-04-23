'use client'

import { motion } from 'framer-motion'
import { Icon } from '~/components/base/icon'

interface TimelineStepProps {
	step: {
		icon: string
		title: string
		description: string
	}
	index: number
	isLast: boolean
}

// Icon configurations
const ICON_CONFIGS = [
	{
		bg: 'bg-indigo-100',
		border: 'border-indigo-200',
		icon: 'text-indigo-600',
		line: 'from-green-500 to-blue-500',
	}, // Project Submission
	{
		bg: 'bg-gray-100',
		border: 'border-gray-200',
		icon: 'text-gray-600',
		line: 'from-green-500 to-blue-500',
	}, // Secure Donations
	{
		bg: 'bg-green-100',
		border: 'border-green-200',
		icon: 'text-green-600',
		line: 'from-green-500 to-blue-500',
	}, // Milestone-Based
	{
		bg: 'bg-blue-100',
		border: 'border-blue-200',
		icon: 'text-blue-600',
		line: 'from-green-500 to-blue-500',
	}, // Community Growth
]

/**
 * TimelineStep - A single step in the vertical timeline
 */
const TimelineStep = ({ step, index, isLast }: TimelineStepProps) => {
	// Get color scheme based on index
	const colorScheme = ICON_CONFIGS[index % ICON_CONFIGS.length]

	return (
		<div className="flex items-start mb-10 pb-10 relative">
			{/* Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				viewport={{ once: true, amount: 0.2 }}
				className="mx-auto w-full"
			>
				{/* Content Card */}
				<div className="relative">
					{/* Line connecting to icon (top colored line) */}
					{index > 0 && (
						<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full h-10 w-[2px] bg-gradient-to-b from-transparent to-gray-300" />
					)}

					{/* Card */}
					<div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
						{/* Top colored border */}
						<div
							className={`h-1 w-full bg-gradient-to-r ${colorScheme.line}`}
						/>

						{/* Icon centered on top edge */}
						<div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
							<motion.div
								initial={{ opacity: 0, scale: 0.5 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.3 }}
								viewport={{ once: true, amount: 0.2 }}
								className={`w-10 h-10 rounded-full ${colorScheme.bg} border-4 border-white shadow-md flex items-center justify-center`}
							>
								<Icon
									name={step.icon}
									className={`w-5 h-5 ${colorScheme.icon}`}
								/>
							</motion.div>
						</div>

						{/* Card content with extra top padding for icon */}
						<div className="p-6 pt-8">
							<h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
								{step.title}
							</h3>
							<p className="text-gray-700 text-center">{step.description}</p>
						</div>
					</div>

					{/* Line connecting to next icon (if not last) */}
					{!isLast && (
						<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full h-10 w-[2px] bg-gradient-to-b from-gray-300 to-transparent" />
					)}
				</div>
			</motion.div>
		</div>
	)
}

export { TimelineStep }
