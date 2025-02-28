interface ProgressIndicatorProps {
	step: number
	totalSteps: number
}

export function ProgressIndicator({
	step,
	totalSteps,
}: ProgressIndicatorProps) {
	const percentage = (step / totalSteps) * 100

	return (
		<div>
			<h3 className="text-lg font-medium mb-2">
				Step {step} of {totalSteps}
			</h3>
			<div className="w-full h-2 bg-gray-200 rounded-full">
				<div
					className="h-2 bg-black rounded-full"
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	)
}
