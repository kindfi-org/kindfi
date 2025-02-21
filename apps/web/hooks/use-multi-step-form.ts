'use client'

import type React from 'react'

import { useState } from 'react'
import type { UseFormTrigger } from 'react-hook-form'
import type { ProjectFormData } from '../lib/validators/project'

interface Step {
	number: number
	label: string
}

interface UseMultiStepFormProps {
	totalSteps: number
	trigger: UseFormTrigger<ProjectFormData>
	steps: Step[]
	fieldsToValidate: {
		[key: number]: (keyof ProjectFormData)[]
	}
}

interface UseMultiStepFormReturn {
	step: number
	steps: Step[]
	previewImage: string | null
	handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
	handleNext: () => Promise<void>
	setStep: (step: number) => void
	setPreviewImage: (image: string | null) => void
}

export function useMultiStepForm({
	totalSteps,
	trigger,
	steps,
	fieldsToValidate,
}: UseMultiStepFormProps): UseMultiStepFormReturn {
	const [step, setStep] = useState(1)
	const [previewImage, setPreviewImage] = useState<string | null>(null)

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (
			file &&
			(file.type.startsWith('image/jpeg') ||
				file.type.startsWith('image/png') ||
				file.type.startsWith('image/gif'))
		) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setPreviewImage(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const handleNext = async () => {
		const currentFields = fieldsToValidate[step]
		if (currentFields) {
			const isStepValid = await trigger(currentFields)
			if (isStepValid) {
				setStep(Math.min(totalSteps, step + 1))
			}
		}
	}

	return {
		step,
		steps,
		previewImage,
		handleImageUpload,
		handleNext,
		setStep,
		setPreviewImage,
	}
}
