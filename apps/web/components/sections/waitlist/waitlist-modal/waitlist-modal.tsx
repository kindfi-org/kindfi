'use client'

import { AnimatePresence } from 'framer-motion'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
import { useI18n } from '~/lib/i18n'
import { StepOne } from './components/step-one'
import { StepThree } from './components/step-three'
import { StepTwo } from './components/step-two'
import { WaitlistProgress } from './components/waitlist-progress'
import { WaitlistSuccess } from './components/waitlist-success'
import { TOTAL_STEPS } from './constants'
import { useWaitlistModal } from './hooks/use-waitlist-modal'

interface WaitlistModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
	const { t } = useI18n()
	const {
		currentStep,
		stepCopy,
		isSubmitting,
		isSuccess,
		submitError,
		handleOpenChange,
		handleNext,
		handleBack,
		handleSubmit,
	} = useWaitlistModal(onOpenChange)

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <StepOne onNext={handleNext} />
			case 2:
				return <StepTwo onNext={handleNext} onBack={handleBack} />
			case 3:
				return <StepThree onBack={handleBack} onSubmit={handleSubmit} isPending={isSubmitting} />
			default:
				return <StepOne onNext={handleNext} />
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
				{isSuccess ? (
					<WaitlistSuccess onClose={() => handleOpenChange(false)} />
				) : (
					<>
						<div className="border-b bg-[#fafbfc] px-6 pb-5 pt-6">
							<DialogHeader className="mt-0 space-y-2 text-left">
								<p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
									{t('waitlist.stepLabel')} {currentStep} / {TOTAL_STEPS}
								</p>
								<DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
									{stepCopy[currentStep - 1]?.title}
								</DialogTitle>
								<DialogDescription className="text-sm leading-relaxed">
									{stepCopy[currentStep - 1]?.description}
								</DialogDescription>
							</DialogHeader>

							<WaitlistProgress currentStep={currentStep} />
						</div>

						<div className="max-h-[min(68vh,560px)] overflow-y-auto px-6 py-6">
							{submitError ? (
								<div
									role="alert"
									className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
								>
									{submitError}
								</div>
							) : null}

							<AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
