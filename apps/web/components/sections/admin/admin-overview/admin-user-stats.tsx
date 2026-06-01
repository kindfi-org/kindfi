'use client'

import { motion } from 'framer-motion'
import { IoPeopleOutline } from 'react-icons/io5'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import type { AdminStats } from '~/lib/queries/admin/get-admin-stats'
import { buildUserStats } from './build-stat-configs'
import { formatPercent } from './formatters'

type AdminUserStatsProps = {
	stats: AdminStats
	reducedMotion: boolean | null
}

export function AdminUserStats({ stats, reducedMotion }: AdminUserStatsProps) {
	const userStats = buildUserStats(stats)

	const motionProps = reducedMotion
		? { initial: false }
		: {
				initial: { opacity: 0, y: 20 },
				animate: { opacity: 1, y: 0 },
				transition: { duration: 0.3 },
			}

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4 text-pretty">Users by Role</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{userStats.map((stat, index) => (
					<motion.div
						key={stat.label}
						{...motionProps}
						transition={
							reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.7 + index * 0.05 }
						}
					>
						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
								<div className={`${stat.bgColor} p-2 rounded-lg`} aria-hidden>
									<IoPeopleOutline className={`h-5 w-5 ${stat.color}`} />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold tabular-nums">{stat.value}</div>
								{stat.value > 0 ? (
									<p className="text-xs text-muted-foreground mt-1">
										{formatPercent(
											stats.totalUsers > 0 ? (stat.value / stats.totalUsers) * 100 : 0,
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
