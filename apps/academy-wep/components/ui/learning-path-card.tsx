import { forwardRef } from 'react'
import { Icon } from '~/components/ui/icon' // Importing the new Icon component
import { Card } from '../base/card' // Updated to relative path
import { Progress } from './progress' // Updated to relative path

interface LearningPathCardProps {
	icon: string // Assuming icon is a string representing the icon name
	title: string
	description: string
	progress: number
}

const LearningPathCard = forwardRef<HTMLDivElement, LearningPathCardProps>(
	({ icon, title, description, progress }, ref) => {
		return (
			<Card
				ref={ref}
				className="p-4 flex items-center space-x-4 hover:shadow-lg transition-all duration-300 group"
			>
				<div className="bg-green-100/50 text-green-600 p-3 rounded-full group-hover:bg-green-100">
					<Icon name={icon} className="h-5 w-5" />{' '}
					{/* Using the new Icon component */}
				</div>
				<div className="flex-1 space-y-2">
					<h2 className="text-lg font-semibold">{title}</h2>
					<p className="text-muted-foreground text-sm">{description}</p>
					<div className="space-y-1">
						<Progress value={progress} className="h-2" />
						<span className="text-xs text-muted-foreground">
							{progress}% complete
						</span>
					</div>
				</div>
			</Card>
		)
	},
)

LearningPathCard.displayName = 'LearningPathCard'
export { LearningPathCard }
