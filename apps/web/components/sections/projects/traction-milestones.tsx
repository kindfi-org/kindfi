'use client'

import { motion } from 'framer-motion'

export interface Milestone {
	id: number
	date: string
	title: string
	description: string
	status?: 'completed' | 'in-progress' | 'upcoming'
}

export interface TractionMilestonesProps {
	title: string
	milestones: Milestone[]
}

export function TractionMilestones({
	title,
	milestones,
}: TractionMilestonesProps) {
	return (
		<div className="max-w-4xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold mb-8">{title}</h1>

				<div className="relative">
					{/* Vertical line */}
					<div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-blue-300" />

					<div className="space-y-8">
						{milestones.map((milestone) => {
							const isInProgress = milestone.status === 'in-progress'
							const isUpcoming = milestone.status === 'upcoming'

							return (
								<motion.div
									key={milestone.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.1 * milestone.id }}
									className="flex items-start gap-6"
								>
									<div
										className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-white font-bold ${
											isUpcoming
												? 'bg-gray-300'
												: isInProgress
													? 'bg-blue-400'
													: 'bg-blue-600'
										}`}
									>
										{milestone.id}
									</div>
									<div className={`pt-1 ${isUpcoming ? 'opacity-70' : ''}`}>
										<h3 className="text-xl font-semibold">
											{milestone.date}: {milestone.title}
											{isInProgress && (
												<span className="ml-2 text-sm font-normal text-blue-500">
													(In Progress)
												</span>
											)}
											{isUpcoming && (
												<span className="ml-2 text-sm font-normal text-gray-500">
													(Upcoming)
												</span>
											)}
										</h3>
										<p className="text-muted-foreground mt-1">
											{milestone.description}
										</p>
									</div>
								</motion.div>
							)
						})}
					</div>
				</div>
			</motion.div>
		</div>
	)
}
