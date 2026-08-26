'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import type { AdminStats } from '~/lib/queries/admin/get-admin-stats'
import { buildMainStats } from './build-stat-configs'

type AdminMainStatsProps = {
	stats: AdminStats
	reducedMotion: boolean | null
}

export function AdminMainStats({ stats, reducedMotion }: AdminMainStatsProps) {
	const mainStats = buildMainStats(stats)

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
					transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: index * 0.1 }}
				>
					<Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
							<div className={`${stat.bgColor} p-2 rounded-lg`} aria-hidden>
								<stat.icon className={`h-5 w-5 ${stat.color}`} />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold mb-1 tabular-nums">{stat.value}</div>
							<p className="text-xs text-muted-foreground">{stat.change}</p>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	)
}
