'use client'

import { useState } from 'react'
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { useI18n } from '~/lib/i18n'
import type {
	WaitlistFormData,
	WaitlistStepThreeData,
} from '~/lib/types/waitlist.types'
import { TOTAL_STEPS } from '../constants'

export function useWaitlistModal(onOpenChange: (open: boolean) => void) {
	const { t } = useI18n()
	const { currentStep, setCurrentStep, formData, resetWaitlist } = useWaitlist()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)

	const stepCopy = [
		{
			title: t('waitlist.stepOneTitle'),
			description: t('waitlist.stepOneDescription'),
		},
		{
			title: t('waitlist.stepTwoTitle'),
			description: t('waitlist.stepTwoDescription'),
		},
		{
			title: t('waitlist.stepThreeTitle'),
			description: t('waitlist.stepThreeDescription'),
		},
	]

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			resetWaitlist()
			setIsSuccess(false)
			setSubmitError(null)
		}
		onOpenChange(nextOpen)
	}

	const handleNext = () => {
		if (currentStep < TOTAL_STEPS) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleSubmit = async (data: WaitlistStepThreeData) => {
		setIsSubmitting(true)
		setSubmitError(null)

		try {
			const body: WaitlistFormData = { ...formData, ...data }
			const res = await fetch('/api/waitlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			if (!res.ok) {
				const err = await res.json().catch(() => ({}) as unknown)
				const message =
					typeof err === 'object' &&
					err !== null &&
					'error' in err &&
					typeof err.error === 'string'
						? err.error
						: t('waitlist.errors.submitFailed')
				throw new Error(message)
			}

			setIsSuccess(true)
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: t('waitlist.errors.submitFailed'),
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		currentStep,
		stepCopy,
		isSubmitting,
		isSuccess,
		submitError,
		handleOpenChange,
		handleNext,
		handleBack,
		handleSubmit,
	}
}
