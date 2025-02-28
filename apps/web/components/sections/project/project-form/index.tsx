/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
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
import { ProjectDetails } from './project-details-step'

// Defines constants before component
const FORM_STEPS = [
	{ number: 1, label: 'Project Details' },
	{ number: 2, label: 'Funding Information' },
	{ number: 3, label: 'Additional Details' },
] as const

const FIELDS_TO_VALIDATE = {
	1: step1Fields,
	2: step2Fields,
	3: step3Fields,
} as const

export function ProjectForm() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		trigger,
		control,
		watch,
	} = useForm<ProjectFormData>({
		resolver: zodResolver(projectFormSchema),
		mode: 'onChange',
	})

	const {
		step,
		previewImage,
		handleImageUpload,
		handleNext,
		setStep,
		setPreviewImage,
		error: imageError,
	} = useMultiStepForm({
		totalSteps: FORM_STEPS.length,
		trigger,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		steps: FORM_STEPS as any,
		fieldsToValidate: FIELDS_TO_VALIDATE,
	})

	const onSubmit = (data: ProjectFormData) => {
		console.log(data)
		// Handle form submission
	}

	const selectedCategory = watch('category')

	const renderFormStep = () => {
		switch (step) {
			case 1:
				return (
					<ProjectDetails
						register={register}
						control={control}
						errors={errors}
						Controller={Controller}
					/>
				)
			case 2:
				return (
					<FundingInformation
						register={register}
						errors={errors}
						setPreviewImage={setPreviewImage}
						previewImage={previewImage}
						handleImageUpload={handleImageUpload}
						imageError={imageError}
					/>
				)
			case 3:
				return <AdditionalDetails register={register} errors={errors} />
			default:
				return null
		}
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="mx-auto max-w-2xl px-4 py-8"
		>
			<div className="text-center mb-8">
				<button
					type="button"
					className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors mb-8"
				>
					Create Project
				</button>
				<h1 className="text-4xl font-bold mb-4">
					Let&apos;s get your KindFi project started
				</h1>
				<p className="text-gray-500 text-lg">
					Create a crowdfunding campaign and make an impact with the power of
					Web3 transparency.
				</p>
			</div>

			{/* Steps indicator */}
			<div className="flex justify-between mb-8 relative">
				<div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200" />
				{FORM_STEPS.map((s) => (
					<div
						key={s.number}
						className="relative flex flex-col items-center gap-2 z-10"
					>
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${
									s.number < step
										? 'bg-black text-white'
										: s.number === step
											? 'bg-black text-white'
											: 'bg-gray-100 text-gray-500'
								}`}
						>
							{s.number < step ? <Check className="h-4 w-4" /> : s.number}
						</div>
						<span
							className={`text-sm ${step === s.number ? 'text-black font-medium' : 'text-gray-500'}`}
						>
							{s.label}
						</span>
						{step === s.number && (
							<div className="absolute -bottom-2 w-full h-0.5 bg-black" />
						)}
					</div>
				))}
			</div>

			<div className="bg-white border border-gray-200 rounded-lg shadow-md">
				<div className="p-6">
					<div className="space-y-8">
						{renderFormStep()}

						<div className="flex justify-between pt-4">
							<button
								type="button"
								onClick={() => setStep(Math.max(1, step - 1))}
								disabled={step === 1}
								className="flex items-center px-4 py-2 border border-gray-200 
                  rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 
                  disabled:cursor-not-allowed"
							>
								<ChevronLeft className="w-4 h-4 mr-2" />
								Previous
							</button>
							{step === 3 ? (
								<button
									type="submit"
									className="flex items-center px-4 py-2 bg-black text-white 
                    rounded-md hover:bg-black/90 transition-colors"
								>
									<Check className="w-4 h-4 mr-2" />
									Submit for Review
								</button>
							) : (
								<button
									type="button"
									onClick={handleNext}
									className="flex items-center px-4 py-2 bg-black text-white 
                    rounded-md hover:bg-black/90 transition-colors"
								>
									Next
									<ChevronRight className="w-4 h-4 ml-2" />
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</form>
	)
}
