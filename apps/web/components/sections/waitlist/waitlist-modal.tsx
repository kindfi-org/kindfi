'use client'

import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Dialog, DialogContent } from '~/components/base/dialog'
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import type {
	WaitlistFormData,
	WaitlistStepThreeData,
} from '~/lib/types/waitlist.types'
import { WaitlistStepOne } from './waitlist-modal/waitlist-step-one'
import { WaitlistStepThree } from './waitlist-modal/waitlist-step-three'
import { WaitlistStepTwo } from './waitlist-modal/waitlist-step-two'
import { WaitlistStepper } from './waitlist-modal/waitlist-stepper'

interface WaitlistModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
	const { currentStep, setCurrentStep, formData } = useWaitlist()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleNext = () => {
		if (currentStep < 3) setCurrentStep(currentStep + 1)
	}
	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1)
	}

	const handleSubmit = async (data: WaitlistStepThreeData) => {
		setIsSubmitting(true)
		try {
			const body: WaitlistFormData = { ...formData, ...data }
			const res = await fetch('/api/waitlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})
			if (!res.ok) {
				const err = await res.json().catch(() => ({}) as unknown)
				const message = err?.error || 'Failed to submit interest'
				console.error('Waitlist submission failed:', err)
				throw new Error(message)
			}
			onOpenChange(false)
		} catch (_e) {
			console.error('Waitlist submit error:', _e)
		} finally {
			setIsSubmitting(false)
		}
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <WaitlistStepOne onNext={handleNext} />
			case 2:
				return <WaitlistStepTwo onNext={handleNext} onBack={handleBack} />
			case 3:
				return (
					<WaitlistStepThree
						onBack={handleBack}
						onSubmit={handleSubmit}
						isPending={isSubmitting}
					/>
				)
			default:
				return <WaitlistStepOne onNext={handleNext} />
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<WaitlistStepper />
				<AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
			</DialogContent>
		</Dialog>
	)
}
