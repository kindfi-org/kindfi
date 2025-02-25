'use client'

import { FileCheck, FileText } from 'lucide-react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/base/accordion'
import { Button } from '~/components/base/button'

interface Step {
	id: string
	title: string
	description: string
}

const steps: Step[] = [
	{
		id: 'raise',
		title: 'Raise $50K minimum',
		description: 'Set your funding goal and create compelling rewards.',
	},
	{
		id: 'legal',
		title: 'Legal Setup',
		description: 'Complete necessary legal documentation and agreements.',
	},
	{
		id: 'compliance',
		title: 'Compliance Review',
		description: 'Ensure your campaign meets all regulatory requirements.',
	},
	{
		id: 'formC',
		title: 'File Form C',
		description: 'Submit required regulatory filings.',
	},
	{
		id: 'publicRaise',
		title: 'Public Raise',
		description: 'Launch your campaign to the public.',
	},
]

export default function UpcomingSteps() {
	return (
		<section className="max-w-2xl mx-auto my-8">
			<h2 className="text-2xl font-bold">Upcoming Steps</h2>

			{/* Accordion for Steps */}
			<Accordion
				type="single"
				collapsible
				className="mt-8 rounded-lg shadow-md p-6"
			>
				{steps.map((step) => (
					<AccordionItem key={step.id} value={step.id} className="border-b">
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
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</section>
	)
}
