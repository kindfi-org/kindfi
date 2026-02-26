'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import {
	IoBusinessOutline,
	IoCheckmarkCircleOutline,
	IoCloseCircleOutline,
	IoCreateOutline,
	IoEyeOutline,
	IoFolderOutline,
	IoPauseCircleOutline,
	IoPeopleOutline,
	IoPlayCircleOutline,
	IoShieldCheckmarkOutline,
	IoStatsChartOutline,
	IoTrendingUpOutline,
	IoWalletOutline,
} from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { getAdminStats } from '~/lib/queries/admin/get-admin-stats'

const formatCurrency = (
	value: number,
	options?: { maxFractionDigits?: number },
) =>
	new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: options?.maxFractionDigits ?? 0,
	}).format(value)

const formatPercent = (value: number, fractionDigits = 1) =>
	new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(value / 100)

export function AdminOverview() {
	const reducedMotion = useReducedMotion()
	const {
		data: stats,
		isLoading,
		error,
	} = useSupabaseQuery('admin-stats', (client) => getAdminStats(client))

	if (isLoading) {
		return (
			<div className="space-y-6" aria-live="polite" aria-busy="true">
				<p className="text-muted-foreground">Loading…</p>
				<div className="h-8 bg-muted animate-pulse rounded w-1/3" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{['admin-sk-1', 'admin-sk-2', 'admin-sk-3', 'admin-sk-4'].map(
						(key) => (
							<div
								key={key}
								className="h-32 bg-muted animate-pulse rounded-lg"
							/>
						),
					)}
				</div>
			</div>
		)
	}

	if (error || !stats) {
		return (
			<div className="text-center py-12" role="alert">
				<p className="text-destructive font-medium">
					Error loading admin stats.
				</p>
				<p className="text-muted-foreground mt-1 text-sm">
					Refresh the page or try again later. If it continues, check your
					connection.
				</p>
			</div>
		)
	}

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

	const userStats = [
		{
			label: 'Admins',
			value: stats.adminUsers,
			color: 'text-red-600',
			bgColor: 'bg-red-100',
		},
		{
			label: 'Creators',
			value: stats.creatorUsers,
			color: 'text-purple-600',
			bgColor: 'bg-purple-100',
		},
		{
			label: 'Donors',
			value: stats.donorUsers,
			color: 'text-blue-600',
			bgColor: 'bg-blue-100',
		},
		{
			label: 'Kinders',
			value: stats.kinderUsers,
			color: 'text-green-600',
			bgColor: 'bg-green-100',
		},
		{
			label: 'Kindlers',
			value: stats.kindlerUsers,
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-100',
		},
		{
			label: 'Pending',
			value: stats.pendingUsers,
			color: 'text-gray-600',
			bgColor: 'bg-gray-100',
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
		<div className="space-y-8">
			<AdminSectionHeader
				title="Dashboard"
				description="Platform activity, statistics, and performance metrics"
			/>

			{/* Key Metrics - Investor Friendly */}
			<div>
				<h2 className="text-2xl font-bold mb-4 text-pretty">
					Key Platform Metrics
				</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Essential statistics for understanding platform health and growth
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card className="border-2 border-green-300 bg-green-100/60">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-green-900">
								Total Community
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-green-900 tabular-nums">
								{stats.totalUsers}
							</div>
							<p className="text-xs text-green-800 mt-1">
								{stats.creatorUsers} creators • {stats.donorUsers} donors
							</p>
						</CardContent>
					</Card>

					<Card className="border-2 border-blue-200 bg-blue-50/50">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-blue-900">
								Active Campaigns
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-blue-900 tabular-nums">
								{stats.activeProjects}
							</div>
							<p className="text-xs text-blue-700 mt-1">
								{stats.totalProjects} total projects
							</p>
						</CardContent>
					</Card>

					<Card className="border-2 border-purple-200 bg-purple-50/50">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-purple-900">
								Total Raised
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-purple-900 tabular-nums">
								{formatCurrency(stats.totalDonations)}
							</div>
							<p className="text-xs text-purple-700 mt-1">
								{formatPercent(stats.fundingProgress)} of total target
							</p>
						</CardContent>
					</Card>

					<Card className="border-2 border-orange-200 bg-orange-50/50">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-orange-900">
								Success Rate
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-orange-900 tabular-nums">
								{stats.totalProjects > 0
									? formatPercent(
											(stats.fundedProjects / stats.totalProjects) * 100,
										)
									: formatPercent(0)}
							</div>
							<p className="text-xs text-orange-700 mt-1">
								{stats.fundedProjects} funded projects
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Main Stats */}
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
								<CardTitle className="text-sm font-medium">
									{stat.label}
								</CardTitle>
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

			{/* Project Statistics by Status */}
			<div>
				<h2 className="text-2xl font-bold mb-4 text-pretty">
					Projects by Status
				</h2>
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

			{/* User Statistics by Role */}
			<div>
				<h2 className="text-2xl font-bold mb-4 text-pretty">Users by Role</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{userStats.map((stat, index) => (
						<motion.div
							key={stat.label}
							{...motionProps}
							transition={
								reducedMotion
									? { duration: 0 }
									: { duration: 0.3, delay: 0.7 + index * 0.05 }
							}
						>
							<Card className="hover:shadow-md transition-shadow">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										{stat.label}
									</CardTitle>
									<div className={`${stat.bgColor} p-2 rounded-lg`} aria-hidden>
										<IoPeopleOutline className={`h-5 w-5 ${stat.color}`} />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold tabular-nums">
										{stat.value}
									</div>
									{stat.value > 0 ? (
										<p className="text-xs text-muted-foreground mt-1">
											{formatPercent(
												stats.totalUsers > 0
													? (stat.value / stats.totalUsers) * 100
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

			{/* Funding Statistics */}
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

			{/* Average Metrics - Investor Insights */}
			<div>
				<h2 className="text-2xl font-bold mb-4 text-pretty">Average Metrics</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								Avg Project Goal
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{stats.totalProjects > 0
									? formatCurrency(stats.totalTarget / stats.totalProjects)
									: formatCurrency(0)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Per project target
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								Avg Project Raised
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{stats.totalProjects > 0
									? formatCurrency(stats.totalDonations / stats.totalProjects)
									: formatCurrency(0)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Per project average
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								Avg Contribution
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{stats.recentActivity.contributions > 0
									? formatCurrency(
											stats.recentActivity.contributionsAmount /
												stats.recentActivity.contributions,
											{ maxFractionDigits: 2 },
										)
									: formatCurrency(0, { maxFractionDigits: 2 })}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Last 7 days average
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								Projects per Foundation
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{stats.totalFoundations > 0
									? (stats.totalProjects / stats.totalFoundations).toFixed(1)
									: '0'}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Average campaigns
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Detailed Breakdowns */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-pretty">Projects Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{Object.entries(stats.projectsByStatus || {})
								.toSorted(([, a], [, b]) => b - a)
								.map(([status, count]) => {
									const percentage =
										stats.totalProjects > 0
											? (count / stats.totalProjects) * 100
											: 0
									return (
										<div key={status} className="space-y-1 min-w-0">
											<div className="flex items-center justify-between text-sm gap-2">
												<span className="capitalize font-medium truncate">
													{status}
												</span>
												<span className="text-muted-foreground tabular-nums shrink-0">
													{count} ({formatPercent(percentage)})
												</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full transition-[width] duration-300 ease-out"
													style={{ width: `${percentage}%` }}
												/>
											</div>
										</div>
									)
								})}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-pretty">Users Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{Object.entries(stats.usersByRole || {})
								.toSorted(([, a], [, b]) => b - a)
								.map(([role, count]) => {
									const percentage =
										stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0
									return (
										<div key={role} className="space-y-1 min-w-0">
											<div className="flex items-center justify-between text-sm gap-2">
												<span className="capitalize font-medium truncate">
													{role}
												</span>
												<span className="text-muted-foreground tabular-nums shrink-0">
													{count} ({formatPercent(percentage)})
												</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full transition-[width] duration-300 ease-out"
													style={{ width: `${percentage}%` }}
												/>
											</div>
										</div>
									)
								})}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<div>
				<h2 className="text-2xl font-bold mb-4 text-pretty">
					Recent Activity (Last 7 Days)
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">New Projects</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold mb-4">
								{stats.recentActivity.projects}
							</div>
							<div className="space-y-2">
								{Object.keys(stats.recentActivity.projectsByStatus || {})
									.length > 0 ? (
									Object.entries(
										stats.recentActivity.projectsByStatus || {},
									).map(([status, count]) => (
										<div
											key={status}
											className="flex items-center justify-between text-sm gap-2 min-w-0"
										>
											<Badge variant="outline" className="capitalize truncate">
												{status}
											</Badge>
											<span className="font-medium tabular-nums shrink-0">
												{count}
											</span>
										</div>
									))
								) : (
									<p className="text-sm text-muted-foreground">
										No projects created this week
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">New Users</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold mb-4">
								{stats.recentActivity.users}
							</div>
							<div className="space-y-2">
								{Object.keys(stats.recentActivity.usersByRole || {}).length >
								0 ? (
									Object.entries(stats.recentActivity.usersByRole || {}).map(
										([role, count]) => (
											<div
												key={role}
												className="flex items-center justify-between text-sm gap-2 min-w-0"
											>
												<Badge
													variant="outline"
													className="capitalize truncate"
												>
													{role}
												</Badge>
												<span className="font-medium tabular-nums shrink-0">
													{count}
												</span>
											</div>
										),
									)
								) : (
									<p className="text-sm text-muted-foreground">
										No users registered this week
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">New Foundations</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">
								{stats.recentActivity.foundations}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">New Contributions</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold mb-2 tabular-nums">
								{stats.recentActivity.contributions}
							</div>
							<div className="text-sm text-muted-foreground">
								Total:{' '}
								{formatCurrency(stats.recentActivity.contributionsAmount, {
									maxFractionDigits: 2,
								})}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Key Insights */}
			<div>
				<h2 className="text-2xl font-bold mb-4 text-pretty">Key Insights</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<Card className="border-l-4 border-l-green-700">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{formatPercent(
									stats.recentActivity.projects > 0 && stats.totalProjects > 0
										? (stats.recentActivity.projects / stats.totalProjects) *
												100
										: 0,
								)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								New projects this week
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-blue-500">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								User Growth Rate
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{formatPercent(
									stats.recentActivity.users > 0 && stats.totalUsers > 0
										? (stats.recentActivity.users / stats.totalUsers) * 100
										: 0,
								)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								New users this week
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-purple-500">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								Engagement Rate
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{stats.totalUsers > 0 && stats.totalProjects > 0
									? (stats.totalProjects / stats.totalUsers).toFixed(2)
									: '0'}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Projects per user
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-orange-500">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Active Rate</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{formatPercent(
									stats.totalProjects > 0
										? (stats.activeProjects / stats.totalProjects) * 100
										: 0,
								)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Projects currently active
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-indigo-500">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								Creator Ratio
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{formatPercent(
									stats.totalUsers > 0
										? (stats.creatorUsers / stats.totalUsers) * 100
										: 0,
								)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Users who are creators
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-red-500">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Donor Ratio</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{formatPercent(
									stats.totalUsers > 0
										? (stats.donorUsers / stats.totalUsers) * 100
										: 0,
								)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Users who are donors
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
