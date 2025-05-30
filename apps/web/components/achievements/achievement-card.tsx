import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { CheckCircle2, Lock, Trophy } from 'lucide-react'

export interface AchievementCardProps {
	title: string
	description: string
	icon: React.ReactNode
	status: 'locked' | 'in-progress' | 'completed'
	progressPercentage?: number
	className?: string
}

export function AchievementCard({
	title,
	description,
	icon,
	status,
	progressPercentage,
	className,
}: AchievementCardProps) {
	const statusConfig = {
		locked: {
			icon: <Lock className="h-6 w-6 text-muted-foreground" />,
			bgColor: 'bg-muted/50',
			textColor: 'text-muted-foreground',
			borderColor: 'border-muted',
		},
		'in-progress': {
			icon: <Trophy className="h-6 w-6 text-yellow-500" />,
			bgColor: 'bg-yellow-500/10',
			textColor: 'text-yellow-500',
			borderColor: 'border-yellow-500/20',
		},
		completed: {
			icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
			bgColor: 'bg-green-500/10',
			textColor: 'text-green-500',
			borderColor: 'border-green-500/20',
		},
	}

	const config = statusConfig[status]

	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-lg border p-6 transition-all',
				config.bgColor,
				config.borderColor,
				className,
			)}
		>
			<div className="flex items-start gap-4">
				<div className="rounded-full bg-background/80 p-2 backdrop-blur-sm">
					{config.icon}
				</div>
				<div className="flex-1 space-y-1">
					<h3 className={cn('font-semibold', config.textColor)}>{title}</h3>
					<p className="text-sm text-muted-foreground">{description}</p>
					{status === 'in-progress' && progressPercentage !== undefined && (
						<div className="mt-2 space-y-1">
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">Progress</span>
								<span className="font-medium text-yellow-500">
									{progressPercentage}%
								</span>
							</div>
							<Progress
								value={progressPercentage}
								className="h-1.5 bg-yellow-500/20"
								indicatorClassName="bg-gradient-to-r from-yellow-500 to-yellow-400"
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
