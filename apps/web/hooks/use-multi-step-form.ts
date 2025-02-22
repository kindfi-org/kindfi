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
	handleImageUpload: (
		event: React.ChangeEvent<HTMLInputElement>,
	) => Promise<void>
	handleNext: () => Promise<void>
	setStep: (step: number) => void
	setPreviewImage: (image: string | null) => void
	error: string | null
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

export function useMultiStepForm({
	totalSteps,
	trigger,
	steps,
	fieldsToValidate,
}: UseMultiStepFormProps): UseMultiStepFormReturn {
	const [step, setStep] = useState(1)
	const [previewImage, setPreviewImage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		try {
			const file = event.target.files?.[0]

			if (!file) {
				throw new Error('No file selected')
			}

			// Validate file type
			if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
				event.target.value = ''
				throw new Error('Please upload a valid image file (JPEG, PNG, or GIF)')
			}

			// Validate file size
			if (file.size > MAX_FILE_SIZE) {
				event.target.value = ''
				throw new Error('File size must not exceed 5MB')
			}

			return new Promise<void>((resolve, reject) => {
				const reader = new FileReader()

				reader.onloadend = () => {
					setPreviewImage(reader.result as string)
					setError(null)
					resolve()
				}

				reader.onerror = () => {
					setPreviewImage(null)
					reject(new Error('Failed to read file'))
				}

				reader.readAsDataURL(file)
			})
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to upload image')
			setPreviewImage(null)
			throw err
		}
	}

	const handleNext = async () => {
		try {
			const currentFields = fieldsToValidate[step]
			if (currentFields) {
				const isStepValid = await trigger(currentFields)
				if (isStepValid) {
					setStep(Math.min(totalSteps, step + 1))
					setError(null)
				}
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to proceed to next step',
			)
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
		error,
	}
}
