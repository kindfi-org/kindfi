'use client'

import { ArrowLeft, ArrowRight, Loader2, Rocket } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { TooltipProvider } from '~/components/base/tooltip'
import { useEscrowForm } from '../context/escrow-form-context'
import {
	ESCROW_WIZARD_STEPS,
	type EscrowWizardStep,
	useEscrowStepValidation,
} from '../hooks/use-escrow-step-validation'
import { useEscrowTransaction } from '../hooks/use-escrow-transaction'
import { useWalletSync } from '../hooks/use-wallet-sync'
import { EscrowBasicFields } from './escrow-basic-fields'
import { EscrowMilestones } from './escrow-milestones'
import { EscrowReviewStep } from './escrow-review-step'
import { EscrowRoleFields } from './escrow-role-fields'
import { EscrowStepIndicator } from './escrow-step-indicator'
import { EscrowTypeSelector } from './escrow-type-selector'
import { SyncEscrowCard } from './sync-escrow-card'
import { TrustlessExternalWalletBanner } from './trustless-external-wallet-banner'

interface EscrowCreationWizardProps {
	projectId: string
	projectSlug: string
}

const STEP_CONTENT: Record<
	Exclude<EscrowWizardStep, 'review'>,
	{ title: string; description: string }
> = {
	type: {
		title: 'Choose Escrow Type',
		description:
			'Single-release pays out once when all releases are approved. Multi-release pays each release separately.',
	},
	details: {
		title: 'Project Details',
		description:
			'We pre-filled these from your project. Adjust anything that should differ on-chain.',
	},
	roles: {
		title: 'Assign Roles',
		description:
			'Each role must be a Stellar G-address from an external wallet (Freighter, xBull, etc.).',
	},
	milestones: {
		title: 'Define Releases',
		description:
			'Describe deliverables. For multi-release, set the amount and receiver for each release.',
	},
}

export function EscrowCreationWizard({ projectId, projectSlug }: EscrowCreationWizardProps) {
	const { formData } = useEscrowForm()
	const [currentStep, setCurrentStep] = useState<EscrowWizardStep>('type')
	const { steps, isFullyValid } = useEscrowStepValidation(formData, projectId)
	const { handleCreateEscrow, isSubmitting } = useEscrowTransaction({ projectId, projectSlug })

	useWalletSync()

	const currentIndex = ESCROW_WIZARD_STEPS.findIndex((step) => step.id === currentStep)
	const currentValidation = steps[currentStep]
	const isFirstStep = currentIndex === 0
	const isReviewStep = currentStep === 'review'

	const handleBack = useCallback(() => {
		if (isFirstStep) return
		setCurrentStep(ESCROW_WIZARD_STEPS[currentIndex - 1].id)
	}, [currentIndex, isFirstStep])

	const handleContinue = useCallback(() => {
		if (isReviewStep) return
		setCurrentStep(ESCROW_WIZARD_STEPS[currentIndex + 1].id)
	}, [currentIndex, isReviewStep])

	const handleStepClick = useCallback(
		(step: EscrowWizardStep) => {
			const targetIndex = ESCROW_WIZARD_STEPS.findIndex((item) => item.id === step)
			if (targetIndex <= currentIndex) {
				setCurrentStep(step)
			}
		},
		[currentIndex],
	)

	const stepTitle = isReviewStep
		? ESCROW_WIZARD_STEPS[currentIndex].label
		: STEP_CONTENT[currentStep].title
	const stepDescription = isReviewStep
		? ESCROW_WIZARD_STEPS[currentIndex].description
		: STEP_CONTENT[currentStep].description

	return (
		<TooltipProvider>
			<div className="space-y-6">
				<TrustlessExternalWalletBanner />

				<EscrowStepIndicator
					currentStep={currentStep}
					stepValidation={steps}
					onStepClick={handleStepClick}
				/>

				<Card>
					<CardHeader>
						<CardTitle className="text-xl text-wrap-balance">{stepTitle}</CardTitle>
						<CardDescription>{stepDescription}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{currentStep === 'type' ? <EscrowTypeSelector /> : null}
						{currentStep === 'details' ? <EscrowBasicFields projectId={projectId} /> : null}
						{currentStep === 'roles' ? <EscrowRoleFields /> : null}
						{currentStep === 'milestones' ? <EscrowMilestones /> : null}
						{currentStep === 'review' ? <EscrowReviewStep /> : null}

						{!currentValidation.valid && currentValidation.issues.length > 0 ? (
							<Alert variant="destructive" aria-live="polite">
								<AlertTitle>
									{isReviewStep
										? 'Fix these items before deploying'
										: 'Complete this step to continue'}
								</AlertTitle>
								<AlertDescription>
									<ul className="mt-2 list-disc space-y-1 pl-4">
										{currentValidation.issues.map((issue) => (
											<li key={issue}>{issue}</li>
										))}
									</ul>
								</AlertDescription>
							</Alert>
						) : null}
					</CardContent>
				</Card>

				<div className="sticky bottom-4 z-20 flex flex-col-reverse gap-3 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={handleBack}
						disabled={isFirstStep || isSubmitting}
						className="w-full sm:w-auto"
					>
						<ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
						Back
					</Button>

					{isReviewStep ? (
						<Button
							type="button"
							onClick={() => handleCreateEscrow(formData)}
							disabled={!isFullyValid || isSubmitting}
							className="w-full sm:w-auto"
							size="lg"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
									Deploying Escrow…
								</>
							) : (
								<>
									<Rocket className="mr-2 h-4 w-4" aria-hidden="true" />
									Deploy Escrow
								</>
							)}
						</Button>
					) : (
						<Button
							type="button"
							onClick={handleContinue}
							disabled={!currentValidation.valid || isSubmitting}
							className="w-full sm:w-auto"
						>
							Continue
							<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
						</Button>
					)}
				</div>
			</div>

			<SyncEscrowCard projectId={projectId} projectSlug={projectSlug} variant="compact" />
		</TooltipProvider>
	)
}
