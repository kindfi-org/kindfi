'use client'

import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { StepperIndicator } from '~/components/sections/projects/create/stepper-indicator'
import {
	StepOne,
	StepThree,
	StepTwo,
} from '~/components/sections/projects/create/steps'
import { useCreateProject } from '~/hooks/contexts/use-create-project.context'
import { useCreateProjectMutation } from '~/hooks/projects/use-create-project-mutation'
import type { StepThreeData } from '~/lib/types/project/create-project.types'

export function CreateProjectForm() {
	const { currentStep, setCurrentStep, formData, updateFormData } =
		useCreateProject()
	const { mutateAsync: createProject, isPending } = useCreateProjectMutation()
	const router = useRouter()

	const handleNext = () => {
		if (currentStep < 3) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleSubmit = async (stepThreeData: StepThreeData) => {
		const fullData = {
			...formData,
			...stepThreeData,
			tags: stepThreeData.tags || [],
		}

		updateFormData(fullData)
		console.log('Submitting project:', fullData)
		const result = await createProject(fullData)
		router.push(`/projects/${result.slug}/manage`)
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <StepOne onNext={handleNext} />
			case 2:
				return <StepTwo onNext={handleNext} onBack={handleBack} />
			case 3:
				return (
					<StepThree
						onBack={handleBack}
						onSubmit={handleSubmit}
						isPending={isPending}
					/>
				)
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
