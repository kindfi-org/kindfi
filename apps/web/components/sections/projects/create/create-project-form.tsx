'use client'

import { AnimatePresence } from 'framer-motion'

import { useCreateProject } from '~/lib/contexts/create-project-context'
import { StepperIndicator } from './stepper-indicator'
import { StepOne, StepThree, StepTwo } from './steps'

export function CreateProjectForm() {
	const { currentStep, setCurrentStep, formData } = useCreateProject()

	const handleNext = () => {
		setCurrentStep(currentStep + 1)
	}

	const handleBack = () => {
		setCurrentStep(currentStep - 1)
	}

	const handleSubmit = () => {
		console.log('Submitting project:', formData)
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <StepOne onNext={handleNext} />
			case 2:
				return <StepTwo onNext={handleNext} onBack={handleBack} />
			case 3:
				return <StepThree onBack={handleBack} onSubmit={handleSubmit} />
			default:
				return <StepOne onNext={handleNext} />
		}
	}

	return (
		<div className="max-w-2xl mx-auto">
			<StepperIndicator currentStep={currentStep} totalSteps={3} />

			<AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
		</div>
	)
}
