/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: any */
'use client'

import { motion, useInView } from 'framer-motion'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useRef } from 'react'
import type { Milestone } from '~/lib/types/project/project-detail.types'

interface MilestonesTabProps {
	milestones: Milestone[]
}

export function MilestonesTab({ milestones }: MilestonesTabProps) {
	const sortedMilestones = [...milestones].sort(
		(a, b) => a.orderIndex - b.orderIndex,
	)

	if (sortedMilestones.length === 0) {
		return (
			<div className="p-6 bg-white rounded-xl shadow-sm text-center text-gray-500">
				No milestones available for this project.
			</div>
		)
	}

	return (
		<motion.div
			className="bg-white rounded-xl shadow-sm p-6"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			<h2 className="text-2xl font-bold mb-8">Project Milestones</h2>

			<div className="relative">
				{/* Vertical timeline line */}
				<div
					className="absolute left-0 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
					aria-hidden="true"
				/>

				<div className="space-y-12">
					{sortedMilestones.map((milestone, index) => (
						<MilestoneCard
							key={milestone.id}
							milestone={milestone}
							index={index}
						/>
					))}
				</div>
			</div>
		</motion.div>
	)
}

interface MilestoneCardProps {
	milestone: Milestone
	index: number
}

function MilestoneCard({ milestone, index }: MilestoneCardProps) {
	const cardRef = useRef<HTMLDivElement>(null)
	const isInView = useInView(cardRef, { once: true, amount: 0.3 })

	const getStatusIcon = (status: string) => {
		const iconProps = { className: 'h-4 w-4', 'aria-hidden': true }
		switch (status) {
			case 'completed':
				return (
					<>
						<CheckCircle {...iconProps} className="text-green-500" />
						<span className="sr-only">Milestone completed</span>
					</>
				)
			case 'pending':
				return (
					<>
						<Clock {...iconProps} className="text-amber-500" />
						<span className="sr-only">Milestone pending</span>
					</>
				)
			case 'approved':
				return (
					<>
						<CheckCircle {...iconProps} className="text-blue-500" />
						<span className="sr-only">Milestone approved</span>
					</>
				)
			case 'rejected':
				return (
					<>
						<AlertCircle {...iconProps} className="text-red-500" />
						<span className="sr-only">Milestone rejected</span>
					</>
				)
			case 'disputed':
				return (
					<>
						<AlertCircle {...iconProps} className="text-yellow-600" />
						<span className="sr-only">Milestone disputed</span>
					</>
				)
			default:
				return null
		}
	}

	const getStatusClass = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800'
			case 'pending':
				return 'bg-amber-100 text-amber-800'
			case 'approved':
				return 'bg-blue-100 text-blue-800'
			case 'rejected':
				return 'bg-red-100 text-red-800'
			case 'disputed':
				return 'bg-yellow-100 text-yellow-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const formattedDate = new Date(milestone.deadline).toLocaleDateString(
		'en-US',
		{
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		},
	)

	return (
		<div ref={cardRef} className="relative">
			{/* Timeline dot */}
			<div className="absolute -left-3 sm:left-0 top-0 z-10 flex items-center justify-center w-6 h-6 sm:w-12 sm:h-12 rounded-full bg-white border-2 shadow-md">
				{getStatusIcon(milestone.status)}
			</div>
			{/* Card content */}
			<motion.div
				className="ml-6 sm:ml-20 relative bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
				initial={{ opacity: 0, x: 50 }}
				animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
				transition={{ duration: 0.5, delay: index * 0.1 }}
			>
				{/* Pointer triangle */}
				<div
					className="hidden sm:block absolute left-0 top-4 w-4 h-4 bg-white border-l border-b border-gray-200 transform -translate-x-2 rotate-45"
					aria-hidden="true"
				/>

				<div className="flex flex-wrap justify-between items-start gap-4 mb-4">
					<h3 className="text-xl font-bold">{milestone.title}</h3>
					<span
						className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(milestone.status)}`}
						aria-label={`Status: ${milestone.status}`}
					>
						{milestone.status
							.replace('-', ' ')
							.replace(/\b\w/g, (l) => l.toUpperCase())}
					</span>
				</div>

				<p className="text-muted-foreground mb-6">{milestone.description}</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="bg-gray-50 p-3 rounded-lg">
						<p className="text-sm text-gray-500 mb-1">Funding Required</p>
						<p className="font-bold">${milestone.amount.toLocaleString()}</p>
					</div>
					<div className="bg-gray-50 p-3 rounded-lg">
						<p className="text-sm text-gray-500 mb-1">Deadline</p>
						<p className="font-bold">{formattedDate}</p>
					</div>
				</div>
			</motion.div>
		</div>
	)
}
