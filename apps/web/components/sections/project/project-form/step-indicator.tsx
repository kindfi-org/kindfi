import { Check } from 'lucide-react'
import { cn } from '~/lib/utils'
import { FORM_STEPS } from '.'

export function StepIndicator({ step }: { step: number }) {
	return (
		<div className="flex justify-between mb-8 relative">
			<div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200" />
			{FORM_STEPS.map((s) => (
				<div
					key={s.number}
					className="relative flex flex-col items-center gap-2 z-10"
				>
					<div
						className={cn(
							'w-8 h-8 rounded-full flex items-center justify-center text-sm',
							s.number < step
								? 'bg-black text-white'
								: s.number === step
								  ? 'bg-black text-white'
								  : 'bg-gray-100 text-gray-500',
						)}
					>
						{s.number < step ? <Check className="h-4 w-4" /> : s.number}
					</div>
					<span
						className={cn(
							'text-sm',
							step === s.number ? 'text-black font-medium' : 'text-gray-500',
						)}
					>
						{s.label}
					</span>
					{step === s.number && (
						<div className="absolute -bottom-2 w-full h-0.5 bg-black" />
					)}
				</div>
			))}
		</div>
	)
}
