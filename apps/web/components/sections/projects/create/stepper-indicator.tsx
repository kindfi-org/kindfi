'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { useCreateProject } from '~/lib/contexts/create-project-context'
import { cn } from '~/lib/utils'
import { isValidUrl } from '~/lib/utils/create-project-helpers'

interface StepperIndicatorProps {
	currentStep: number
	totalSteps: number
}

const stepLabels = [
	'Basic Information',
	'Media and Links',
	'Location and Classification',
]

export function StepperIndicator({
	currentStep,
	totalSteps,
}: StepperIndicatorProps) {
	const { formData } = useCreateProject()

	// Checks if a step's required fields are valid
	const isStepValid = (stepNumber: number): boolean => {
		switch (stepNumber) {
			case 1:
				return Boolean(
					formData.title?.length >= 3 &&
						formData.description?.length >= 10 &&
						formData.targetAmount > 0 &&
						formData.minimumInvestment > 0 &&
						formData.minimumInvestment <= formData.targetAmount,
				)

			case 2: {
				const websiteValid = !formData.website || isValidUrl(formData.website)
				const socialLinksValid =
					formData.socialLinks?.every((link) => isValidUrl(link)) ?? true
				return websiteValid && socialLinksValid
			}

			case 3:
				return Boolean(formData.location && formData.category)

			default:
				return false
		}
	}

	return (
		<div className="mx-auto mb-8 w-full max-w-md">
			{/* Progress bar */}
			<div className="mb-4 flex items-center justify-between">
				{Array.from({ length: totalSteps }, (_, index) => {
					const stepNumber = index + 1
					const isCurrent = currentStep === stepNumber
					const isCompleted =
						stepNumber < currentStep && isStepValid(stepNumber)
					const isConnected = index < totalSteps - 1

					return (
						<div key={stepNumber} className="flex items-center">
							{/* Step circle */}
							<motion.div
								className={cn(
									'relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium',
									{
										'bg-green-500 border-green-500 text-white': isCompleted,
										'bg-indigo-950 border-indigo-950 text-white': isCurrent,
										'bg-white border-gray-300 text-gray-500':
											!isCurrent && !isCompleted,
									},
								)}
								initial={{ scale: 0.8 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.2 }}
							>
								{isCompleted ? (
									<Check className="h-5 w-5" aria-hidden="true" />
								) : (
									<span>{stepNumber}</span>
								)}
							</motion.div>

							{/* Connecting line */}
							{isConnected && (
								<div className="mx-2 flex items-center justify-center">
									<div className="relative h-1 w-16 sm:w-32 md:w-36 bg-gray-200 overflow-hidden rounded-full">
										<motion.div
											className="absolute left-0 top-0 h-full bg-indigo-950"
											initial={{ width: 0 }}
											animate={{ width: isCompleted ? '100%' : 0 }}
											transition={{ duration: 0.3 }}
										/>
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>

			{/* Step description */}
			<motion.div
				key={currentStep}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="text-center"
			>
				<p className="text-lg font-medium text-gray-900">
					{stepLabels[currentStep - 1]}
				</p>
			</motion.div>
		</div>
	)
}
