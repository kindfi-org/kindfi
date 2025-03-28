import { UserCircle } from 'lucide-react' // Using direct Lucide import
import { forwardRef } from 'react'
import { Card } from '~/components/ui/card'

interface StatsDisplayProps {
	count: number
	className?: string
}

const StatsDisplay = forwardRef<HTMLDivElement, StatsDisplayProps>(
	({ count, className }, ref) => {
		return (
			<Card
				ref={ref}
				className={`rounded-full w-40 h-40 p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow ${className}`}
			>
				<UserCircle className="h-12 w-12 text-primary" />
				<span className="text-3xl font-bold mt-2">{count}+</span>
				<span className="text-sm text-muted-foreground">Learning Paths</span>
			</Card>
		)
	},
)

StatsDisplay.displayName = 'StatsDisplay'
export { StatsDisplay }
