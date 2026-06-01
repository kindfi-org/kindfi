'use client'

import { motion } from 'framer-motion'
import {
	IoPlayCircleOutline,
	IoStatsChartOutline,
	IoTrendingUpOutline,
	IoWalletOutline,
} from 'react-icons/io5'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { AdminStats } from '~/lib/queries/admin/get-admin-stats'
import { formatCurrency, formatPercent } from './formatters'

type AdminFundingStatsProps = {
	stats: AdminStats
	reducedMotion: boolean | null
}

export function AdminFundingStats({
	stats,
	reducedMotion,
}: AdminFundingStatsProps) {
	const motionProps = reducedMotion
		? { initial: false }
		: {
				initial: { opacity: 0, y: 20 },
				animate: { opacity: 1, y: 0 },
				transition: { duration: 0.3 },
			}

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4 text-pretty">
				Funding Statistics
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<motion.div
					{...motionProps}
					transition={
						reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 1.0 }
					}
				>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Raised
							</CardTitle>
							<div className="bg-green-200 p-2 rounded-lg" aria-hidden>
								<IoWalletOutline className="h-5 w-5 text-green-700" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{formatCurrency(stats.totalDonations, {
									maxFractionDigits: 2,
								})}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Across all projects
							</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					{...motionProps}
					transition={
						reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 1.05 }
					}
				>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Target
							</CardTitle>
							<div className="bg-blue-100 p-2 rounded-lg" aria-hidden>
								<IoStatsChartOutline className="h-5 w-5 text-blue-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{formatCurrency(stats.totalTarget, {
									maxFractionDigits: 2,
								})}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Combined goals
							</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					{...motionProps}
					transition={
						reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 1.1 }
					}
				>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Overall Progress
							</CardTitle>
							<div className="bg-purple-100 p-2 rounded-lg" aria-hidden>
								<IoTrendingUpOutline className="h-5 w-5 text-purple-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold tabular-nums">
								{formatPercent(stats.fundingProgress)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								of total target
							</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					{...motionProps}
					transition={
						reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 1.15 }
					}
				>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Projects Progress
							</CardTitle>
							<div className="bg-emerald-200 p-2 rounded-lg" aria-hidden>
								<IoPlayCircleOutline className="h-5 w-5 text-emerald-700" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold tabular-nums">
								{formatPercent(stats.activeProjectsProgress)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								{formatCurrency(stats.activeProjectsRaised)} /{' '}
								{formatCurrency(stats.activeProjectsTarget)}
							</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	)
}
