'use client'

import { Check } from 'lucide-react'
import { cn } from '~/lib/utils'
import {
	ESCROW_WIZARD_STEPS,
	type EscrowWizardStep,
	type StepValidation,
} from '../hooks/use-escrow-step-validation'

interface EscrowStepIndicatorProps {
	currentStep: EscrowWizardStep
	stepValidation: Record<EscrowWizardStep, StepValidation>
	onStepClick?: (step: EscrowWizardStep) => void
}

export function EscrowStepIndicator({
	currentStep,
	stepValidation,
	onStepClick,
}: EscrowStepIndicatorProps) {
	const currentIndex = ESCROW_WIZARD_STEPS.findIndex((step) => step.id === currentStep)

	return (
		<nav aria-label="Escrow creation progress" className="w-full space-y-2">
			<ol className="flex flex-wrap gap-2">
				{ESCROW_WIZARD_STEPS.map((step, index) => {
					const isCurrent = step.id === currentStep
					const isPast = index < currentIndex
					const isComplete = stepValidation[step.id].valid && (isPast || isCurrent)
					const isIncomplete = !stepValidation[step.id].valid && !isCurrent
					const isClickable = Boolean(onStepClick) && (isPast || stepValidation[step.id].valid)

					return (
						<li key={step.id}>
							<button
								type="button"
								disabled={!isClickable}
								onClick={() => {
									if (isClickable) onStepClick?.(step.id)
								}}
								className={cn(
									'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
									isComplete && !isCurrent
										? 'border-emerald-600/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
										: null,
									isCurrent
										? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
										: null,
									isIncomplete ? 'border-border bg-background text-muted-foreground' : null,
									isClickable ? 'cursor-pointer hover:border-blue-500/50' : 'cursor-default',
								)}
								aria-current={isCurrent ? 'step' : undefined}
								aria-label={`${step.label}${isComplete ? ', completed' : isCurrent ? ', current step' : ''}`}
							>
								{isComplete && !isCurrent ? (
									<Check className="h-3.5 w-3.5" aria-hidden="true" />
								) : (
									<span
										className={cn(
											'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
											isCurrent ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground',
										)}
									>
										{index + 1}
									</span>
								)}
								{step.shortLabel}
							</button>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
