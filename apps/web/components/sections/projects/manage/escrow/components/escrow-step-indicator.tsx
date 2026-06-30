'use client'

import { useReducedMotion } from 'framer-motion'
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
	const prefersReducedMotion = useReducedMotion()
	const currentIndex = ESCROW_WIZARD_STEPS.findIndex((step) => step.id === currentStep)

	return (
		<nav aria-label="Escrow creation progress" className="w-full">
			<ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				{ESCROW_WIZARD_STEPS.map((step, index) => {
					const isCurrent = step.id === currentStep
					const isPast = index < currentIndex
					const isComplete = isPast && stepValidation[step.id].valid
					const isClickable = Boolean(onStepClick) && (isPast || isComplete)

					return (
						<li
							key={step.id}
							className="flex min-w-0 flex-1 items-start gap-3 sm:flex-col sm:items-center"
						>
							<button
								type="button"
								disabled={!isClickable}
								onClick={() => isClickable && onStepClick?.(step.id)}
								className={cn(
									'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-[background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									isComplete && 'border-emerald-600 bg-emerald-600 text-white',
									isCurrent && !isComplete && 'border-primary bg-primary text-primary-foreground',
									!isCurrent &&
										!isComplete &&
										'border-muted-foreground/30 bg-background text-muted-foreground',
									isClickable && 'cursor-pointer hover:border-primary/70',
									!isClickable && 'cursor-default',
								)}
								aria-current={isCurrent ? 'step' : undefined}
								aria-label={`${step.label}${isComplete ? ', completed' : isCurrent ? ', current step' : ''}`}
							>
								{isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
							</button>

							<div className="min-w-0 flex-1 sm:text-center">
								<p
									className={cn(
										'text-sm font-medium text-wrap-balance',
										isCurrent ? 'text-foreground' : 'text-muted-foreground',
									)}
								>
									{step.shortLabel}
								</p>
								{isCurrent ? (
									<p
										className="mt-0.5 hidden text-xs text-muted-foreground sm:block"
										style={{ transition: prefersReducedMotion ? undefined : 'opacity 0.2s' }}
									>
										{step.description}
									</p>
								) : null}
							</div>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
