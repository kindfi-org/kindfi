'use client'

import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'

export function WaitlistStepper() {
	const { currentStep } = useWaitlist()
	const steps = ['Your interest', 'Project (optional)', 'Consent']

	return (
		<div className="flex justify-center items-center mb-6">
			{steps.map((label, index) => {
				const stepNumber = index + 1
				const isActive = currentStep === stepNumber
				const isCompleted = currentStep > stepNumber
				return (
					<div key={label} className="flex items-center">
						<div
							className={`h-2 w-8 rounded-full mx-1 ${
								isActive
									? 'bg-blue-600'
									: isCompleted
										? 'bg-green-600'
										: 'bg-gray-200'
							}`}
						/>
					</div>
				)
			})}
		</div>
	)
}
