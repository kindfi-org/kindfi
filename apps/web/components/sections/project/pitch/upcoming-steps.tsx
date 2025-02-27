'use client'

import { motion } from 'framer-motion'
import { FileCheck, FileText } from 'lucide-react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/base/accordion'
import { Button } from '~/components/base/button'
import {
	fadeInUp,
	fadeSlideDown,
	fadeSlideLeft,
} from '~/lib/constants/animations'
import { steps } from '~/lib/mock-data/project/mock-pitch'

export default function UpcomingSteps() {
	return (
		<motion.section className="mx-auto my-8" {...fadeInUp}>
			<h2 className="text-2xl font-bold">Upcoming Steps</h2>

			{/* Accordion for Steps */}
			<Accordion
				type="single"
				collapsible
				className="mt-8 rounded-lg shadow-md p-6"
			>
				{steps.map((step, index) => (
					<motion.div key={step.id} {...fadeSlideLeft(0.7 + index * 0.1)}>
						<AccordionItem value={step.id} className="border-b">
							<AccordionTrigger className="flex justify-between w-full py-3 text-left hover:no-underline">
								<div className="flex items-center gap-3">
									<div className="border-2 rounded-full border-gray-700">
										<FileText className="w-6 h-6 text-gray-600 p-1" />
									</div>
									<div>
										<h3 className="text-lg font-semibold">{step.title}</h3>
										<p className="text-gray-500 text-sm">{step.description}</p>
									</div>
								</div>
							</AccordionTrigger>

							<AccordionContent className="px-12 pb-4">
								<motion.div {...fadeSlideDown}>
									<p className="text-gray-600">
										Additional details and instructions for completing this step
										will appear here.
									</p>
									<Button
										variant="outline"
										size="sm"
										className="mt-3 flex items-center gap-2"
									>
										<FileCheck className="w-4 h-4" /> Start This Step
									</Button>
								</motion.div>
							</AccordionContent>
						</AccordionItem>
					</motion.div>
				))}
			</Accordion>
		</motion.section>
	)
}
