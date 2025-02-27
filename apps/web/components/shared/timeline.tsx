import { TimelineStep } from './timeline-step'

interface Step {
	icon: string
	title: string
	description: string
}

interface TimelineProps {
	steps: Step[]
}

/**
 * Timeline - A responsive timeline component.
 *
 * @component
 * @param {TimelineProps} props - The component props.
 * @param {Step[]} props.steps - An array of steps containing an icon, title, and description.
 * @returns {JSX.Element} The rendered Timeline component.
 */
const Timeline = ({ steps }: TimelineProps) => {
	return (
		<div className="relative w-full max-w-5xl mx-auto py-10 flex flex-col justify-center">

			<div className="absolute left-1/2 transform -translate-x-1/2 w-[3px] bg-gray-400 h-full hidden md:block">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-500 rounded-full"></div>
				<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-500 rounded-full"></div>
			</div>

			<div className="flex flex-col items-center space-y-8 md:space-y-0">
				{steps.map((step, index) => (
					<TimelineStep
						key={index}
						step={step}
						isLeft={index % 2 === 0}
					/>
				))}
			</div>
		</div>
	)
}

export { Timeline }
