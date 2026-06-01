import { cn } from '~/lib/utils'
import { TOTAL_STEPS } from '../constants'

interface WaitlistProgressProps {
	currentStep: number
}

export function WaitlistProgress({ currentStep }: WaitlistProgressProps) {
	return (
		<div className="mt-5 flex gap-2">
			{Array.from({ length: TOTAL_STEPS }).map((_, index) => {
				const stepNumber = index + 1
				const isActive = currentStep === stepNumber
				const isCompleted = currentStep > stepNumber

				return (
					<div
						key={stepNumber}
						className={cn(
							'h-1.5 flex-1 rounded-full transition-colors duration-300',
							isActive && 'bg-emerald-600',
							isCompleted && 'bg-emerald-500/70',
							!isActive && !isCompleted && 'bg-slate-200',
						)}
					/>
				)
			})}
		</div>
	)
}
