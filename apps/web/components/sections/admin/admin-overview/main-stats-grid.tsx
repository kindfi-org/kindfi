import { motion } from 'framer-motion'
import {
	IoBusinessOutline,
	IoFolderOutline,
	IoPeopleOutline,
	IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { MotionSectionProps } from './types'

export const MainStatsGrid = ({ stats, reducedMotion }: MotionSectionProps) => {
	const mainStats = [
		{
			label: 'Total Projects',
			value: stats.totalProjects,
			icon: IoFolderOutline,
			color: 'text-blue-600',
			bgColor: 'bg-blue-100',
			change: `+${stats.recentActivity.projects} this week`,
		},
		{
			label: 'Total Foundations',
			value: stats.totalFoundations,
			icon: IoBusinessOutline,
			color: 'text-purple-600',
			bgColor: 'bg-purple-100',
			change: `+${stats.recentActivity.foundations} this week`,
		},
		{
			label: 'Total Users',
			value: stats.totalUsers,
			icon: IoPeopleOutline,
			color: 'text-green-700',
			bgColor: 'bg-green-200',
			change: `+${stats.recentActivity.users} this week`,
		},
		{
			label: 'Total Escrows',
			value: stats.totalEscrows,
			icon: IoShieldCheckmarkOutline,
			color: 'text-orange-600',
			bgColor: 'bg-orange-100',
			change: 'Active contracts',
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
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{mainStats.map((stat, index) => (
				<motion.div
					key={stat.label}
					{...motionProps}
					transition={
						reducedMotion
							? { duration: 0 }
							: { duration: 0.3, delay: index * 0.1 }
					}
				>
					<Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
							<div className={`${stat.bgColor} p-2 rounded-lg`} aria-hidden>
								<stat.icon className={`h-5 w-5 ${stat.color}`} />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold mb-1 tabular-nums">
								{stat.value}
							</div>
							<p className="text-xs text-muted-foreground">{stat.change}</p>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	)
}
