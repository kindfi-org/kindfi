'use client'

import { TimelineStep } from './timeline-step'

interface Step {
	icon: string
	title: string
	description: string
}

interface TimelineProps {
	steps: Step[]
	title?: string
	subtitle?: string
}

/**
 * Timeline - A vertical timeline component with steps down the center.
 */
const Timeline = ({ steps }: TimelineProps) => {
	return (
		<section className="py-16">
			<div className="container mx-auto max-w-3xl px-4">
				{/* Timeline container */}
				<div className="relative">
					{/* Vertical center line */}
					<div className="absolute left-1/2 transform -translate-x-1/2 w-[2px] bg-gray-300 h-full">
						<div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full" />
						<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full" />
					</div>

					{/* Timeline steps in vertical arrangement */}
					<div className="relative z-10">
						{steps.map((step, index) => (
							<TimelineStep
								key={step.title || `step-${index}`}
								step={step}
								index={index}
								isLast={index === steps.length - 1}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export { Timeline }
