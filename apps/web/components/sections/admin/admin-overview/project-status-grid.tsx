import { motion } from 'framer-motion'
import {
	IoCheckmarkCircleOutline,
	IoCloseCircleOutline,
	IoCreateOutline,
	IoEyeOutline,
	IoPauseCircleOutline,
	IoPlayCircleOutline,
} from 'react-icons/io5'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { MotionSectionProps } from './types'
import { formatPercent } from './utils'

export const ProjectStatusGrid = ({
	stats,
	reducedMotion,
}: MotionSectionProps) => {
	const projectStats = [
		{
			label: 'Active Projects',
			value: stats.activeProjects,
			icon: IoPlayCircleOutline,
			color: 'text-emerald-700',
			bgColor: 'bg-emerald-200',
		},
		{
			label: 'Draft Projects',
			value: stats.draftProjects,
			icon: IoCreateOutline,
			color: 'text-gray-600',
			bgColor: 'bg-gray-100',
		},
		{
			label: 'In Review',
			value: stats.reviewProjects,
			icon: IoEyeOutline,
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-100',
		},
		{
			label: 'Funded Projects',
			value: stats.fundedProjects,
			icon: IoCheckmarkCircleOutline,
			color: 'text-indigo-600',
			bgColor: 'bg-indigo-100',
		},
		{
			label: 'Paused Projects',
			value: stats.pausedProjects,
			icon: IoPauseCircleOutline,
			color: 'text-orange-600',
			bgColor: 'bg-orange-100',
		},
		{
			label: 'Rejected Projects',
			value: stats.rejectedProjects,
			icon: IoCloseCircleOutline,
			color: 'text-red-600',
			bgColor: 'bg-red-100',
		},
	]

	const motionProps = reducedMotion
		? { initial: false }
		: {
				initial: { opacity: 0, y: 20 },
				animate: { opacity: 1, y: 0 },
				transition: { duration: 0.3 },
			}

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4 text-pretty">Projects by Status</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{projectStats.map((stat, index) => (
					<motion.div
						key={stat.label}
						{...motionProps}
						transition={
							reducedMotion
								? { duration: 0 }
								: { duration: 0.3, delay: 0.4 + index * 0.05 }
						}
					>
						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{stat.label}
								</CardTitle>
								<div className={`${stat.bgColor} p-2 rounded-lg`} aria-hidden>
									<stat.icon className={`h-5 w-5 ${stat.color}`} />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold tabular-nums">
									{stat.value}
								</div>
								{stat.value > 0 ? (
									<p className="text-xs text-muted-foreground mt-1">
										{formatPercent(
											stats.totalProjects > 0
												? (stat.value / stats.totalProjects) * 100
												: 0,
										)}{' '}
										of total
									</p>
								) : null}
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</div>
	)
}
