'use client'

import { motion } from 'framer-motion'
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from '~/components/base/card'
import { Icon } from '~/components/base/icon'

interface TimelineStepProps {
	step: {
		icon: string
		title: string
		description: string
	}
	isLeft: boolean
}

const animationProps = {
	initial: { opacity: 0, y: 30 },
	whileInView: { opacity: 1, y: 0 },
	transition: { duration: 0.6, ease: 'easeOut' },
	viewport: { once: true, amount: 0.2 },
}

const iconAnimationProps = {
	initial: { opacity: 0, scale: 0.8 },
	whileInView: { opacity: 1, scale: 1 },
	transition: { duration: 1, ease: 'easeOut' },
	viewport: { once: true, amount: 0.2 },
}

const TimelineStep = ({ step, isLeft }: TimelineStepProps) => {
	return (
		<div className="relative flex w-full py-6 items-center">
			{isLeft ? (
				<>
					<div className="w-1/2 flex justify-end pr-10 max-md:w-full max-md:pr-0">
						<motion.div
							{...animationProps}
							initial={{ opacity: 0, x: -60 }}
							whileInView={{ opacity: 1, x: 0 }}
						>
							<Card className="w-96 h-32 shadow-lg border border-gray-200 flex items-center justify-center text-center max-md:w-full max-md:h-auto max-md:px-6 max-md:py-4">
								<CardContent className="flex flex-col items-center justify-center text-center">
									<CardTitle className="mb-2 text-lg max-md:text-base">
										{step.title}
									</CardTitle>
									<CardDescription className="leading-relaxed text-sm max-md:text-xs">
										{step.description}
									</CardDescription>
								</CardContent>
							</Card>
						</motion.div>
					</div>
					<div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center max-md:relative max-md:left-0 max-md:translate-x-0 max-md:mt-4">
						<motion.div {...iconAnimationProps}>
							<div className="w-10 h-10 bg-gray-500 text-white flex items-center justify-center rounded-full shadow-lg max-md:w-8 max-md:h-8">
								<Icon
									name={step.icon}
									className="w-5 h-5 text-white max-md:w-4 max-md:h-4"
								/>
							</div>
						</motion.div>
					</div>
					<div className="w-1/2 max-md:hidden" />
				</>
			) : (
				<>
					<div className="w-1/2 max-md:hidden" />
					<div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center max-md:relative max-md:left-0 max-md:translate-x-0 max-md:mt-4">
						<motion.div {...iconAnimationProps}>
							<div className="w-10 h-10 bg-gray-500 text-white flex items-center justify-center rounded-full shadow-lg max-md:w-8 max-md:h-8">
								<Icon
									name={step.icon}
									className="w-5 h-5 text-white max-md:w-4 max-md:h-4"
								/>
							</div>
						</motion.div>
					</div>
					<div className="w-1/2 flex justify-start pl-10 max-md:w-full max-md:pl-0">
						<motion.div
							{...animationProps}
							initial={{ opacity: 0, x: 60 }}
							whileInView={{ opacity: 1, x: 0 }}
						>
							<Card className="w-96 h-32 shadow-lg border border-gray-200 flex items-center justify-center text-center max-md:w-full max-md:h-auto max-md:px-6 max-md:py-4">
								<CardContent className="flex flex-col items-center justify-center text-center">
									<CardTitle className="mb-2 text-lg max-md:text-base">
										{step.title}
									</CardTitle>
									<CardDescription className="leading-relaxed text-sm max-md:text-xs">
										{step.description}
									</CardDescription>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</>
			)}
		</div>
	)
}

export { TimelineStep }
