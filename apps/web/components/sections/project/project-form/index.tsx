'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '~/components/base/button'
import { Form } from '~/components/base/form'
import { useMultiStepForm } from '~/hooks/use-multi-step-form'
import {
	type ProjectFormData,
	projectFormSchema,
	step1Fields,
	step2Fields,
	step3Fields,
} from '~/lib/validators/project'
import { AdditionalDetails } from './additional-details-step'
import { FundingInformation } from './funding-information-step'
import { HeaderProjectForm } from './header-project-form'
import { ProjectDetails } from './project-details-step'
import { StepIndicator } from './step-indicator'

const FIELDS_TO_VALIDATE = {
	1: step1Fields,
	2: step2Fields,
	3: step3Fields,
} as const

export const FORM_STEPS = [
	{ number: 1, label: 'Project Details' },
	{ number: 2, label: 'Funding Information' },
	{ number: 3, label: 'Additional Details' },
]

export function ProjectForm() {
	const form = useForm<z.infer<typeof projectFormSchema>>({
		resolver: zodResolver(projectFormSchema),
		defaultValues: {
			website: '',
			location: '',
			description: '',
			previousFunding: '',
			fundingGoal: '',
			projectSupport: '',
			fundUsage: '',
		},
	})

	const {
		step,
		previewImage,
		handleImageUpload,
		handleNext,
		setStep,
		setPreviewImage,
	} = useMultiStepForm({
		totalSteps: FORM_STEPS.length,
		trigger: form.trigger,
		steps: FORM_STEPS,
		fieldsToValidate: FIELDS_TO_VALIDATE,
	})

	const onSubmit = (data: ProjectFormData) => {
		console.log(data)
		// Handle form submission
	}

	const renderFormStep = () => {
		switch (step) {
			case 1:
				return <ProjectDetails control={form.control} />
			case 2:
				return (
					<FundingInformation
						control={form.control}
						setPreviewImage={setPreviewImage}
						previewImage={previewImage}
						handleImageUpload={handleImageUpload}
					/>
				)
			case 3:
				return <AdditionalDetails control={form.control} />
			default:
				return null
		}
	}

	return (
		<section className="mx-auto max-w-2xl px-4 py-8">
			<HeaderProjectForm />

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<StepIndicator step={step} />

					<div className="bg-white border border-gray-200 rounded-lg shadow-md">
						<div className="space-y-8 p-6">
							{renderFormStep()}

							<div className="flex justify-between pt-4">
								<Button
									onClick={() => setStep(Math.max(1, step - 1))}
									disabled={step === 1}
									variant="outline"
								>
									<ChevronLeft />
									Previous
								</Button>
								{step === 3 ? (
									<Button type="submit" variant="secondary">
										<Check />
										Submit for Review
									</Button>
								) : (
									<Button onClick={handleNext} variant="secondary">
										Next
										<ChevronRight />
									</Button>
								)}
							</div>
						</div>
					</div>
				</form>
			</Form>
		</section>
	)
}
