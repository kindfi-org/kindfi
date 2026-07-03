'use client'

import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { StepperIndicator } from '~/components/sections/projects/create/stepper-indicator'
import { StepOne, StepThree, StepTwo } from '~/components/sections/projects/create/steps'
import { useCreateProject } from '~/hooks/contexts/use-create-project.context'
import { useProjectMutation } from '~/hooks/projects/use-project-mutation'
import type { StepThreeData } from '~/lib/types/project/create-project.types'

type CreateProjectFormProps = {
	developmentOnly?: boolean
	successRedirectPath?: (slug: string) => string
}

export function CreateProjectForm({
	developmentOnly = false,
	successRedirectPath = (slug) => `/projects/${slug}/manage`,
}: CreateProjectFormProps) {
	const { currentStep, setCurrentStep, formData, updateFormData } = useCreateProject()
	const { mutateAsync: createProject, isPending } = useProjectMutation({ developmentOnly })
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
		const result = await createProject(fullData)
		if ('slug' in result && result.slug) {
			router.push(successRedirectPath(result.slug))
		} else {
			router.push(developmentOnly ? '/admin/projects' : '/projects')
		}
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <StepOne onNext={handleNext} />
			case 2:
				return <StepTwo onNext={handleNext} onBack={handleBack} />
			case 3:
				return <StepThree onBack={handleBack} onSubmit={handleSubmit} isPending={isPending} />
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
