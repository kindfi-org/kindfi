'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import {
	IoBusinessOutline,
	IoFolderOutline,
	IoPeopleOutline,
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
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { getAdminStats } from '~/lib/queries/admin/get-admin-stats'

const formatCurrency = (value: number, maxFractionDigits = 0) =>
	new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: maxFractionDigits,
	}).format(value)

const formatPercent = (value: number, fractionDigits = 1) =>
	new Intl.NumberFormat(undefined, {
		style: 'percent',
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(value / 100)

const SKELETON_KEYS = ['ana-1', 'ana-2', 'ana-3', 'ana-4'] as const

export function AdminAnalytics() {
	const {
		data: stats,
		isLoading,
		error,
	} = useSupabaseQuery('admin-stats', (client) => getAdminStats(client))

	if (isLoading) {
		return (
			<div className="space-y-8" aria-live="polite" aria-busy="true">
				<div>
					<div className="h-8 w-48 bg-muted animate-pulse rounded" />
					<div className="mt-2 h-4 w-72 bg-muted animate-pulse rounded" />
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{SKELETON_KEYS.map((key) => (
						<div
							key={key}
							className="h-28 rounded-lg border bg-muted/50 animate-pulse"
						/>
					))}
				</div>
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="h-80 rounded-lg border bg-muted/50 animate-pulse" />
					<div className="h-80 rounded-lg border bg-muted/50 animate-pulse" />
				</div>
			</div>
		)
	}

	if (error || !stats) {
		return (
			<div className="space-y-6">
				<AdminSectionHeader
					title="Analytics"
					description="Platform insights and metrics"
				/>
				<Card className="border-destructive/50">
					<CardContent className="py-12 text-center">
						<p className="font-medium text-destructive">
							Error loading analytics.
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Refresh the page or try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	const projectEntries = Object.entries(stats.projectsByStatus || {}).toSorted(
		([, a], [, b]) => b - a,
	)
	const userEntries = Object.entries(stats.usersByRole || {}).toSorted(
		([, a], [, b]) => b - a,
	)
	const totalProjects = stats.totalProjects || 1
	const totalUsers = stats.totalUsers || 1

	return (
		<div className="space-y-8">
			<AdminSectionHeader
				title="Analytics"
				description="Platform insights, distributions, and key metrics"
			/>

			{/* KPI cards */}
			<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total community
						</CardTitle>
						<span className="rounded-md bg-muted p-2" aria-hidden>
							<IoPeopleOutline className="h-4 w-4 text-muted-foreground" />
						</span>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{stats.totalUsers}
						</p>
						<p className="text-xs text-muted-foreground">
							+{stats.recentActivity.users} in last 7 days
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active campaigns
						</CardTitle>
						<span className="rounded-md bg-muted p-2" aria-hidden>
							<IoFolderOutline className="h-4 w-4 text-muted-foreground" />
						</span>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{stats.activeProjects}
						</p>
						<p className="text-xs text-muted-foreground">
							{stats.totalProjects} total projects
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total raised</CardTitle>
						<span className="rounded-md bg-muted p-2" aria-hidden>
							<IoWalletOutline className="h-4 w-4 text-muted-foreground" />
						</span>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{formatCurrency(stats.totalDonations)}
						</p>
						<p className="text-xs text-muted-foreground">
							{formatPercent(stats.fundingProgress)} of target
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Success rate</CardTitle>
						<span className="rounded-md bg-muted p-2" aria-hidden>
							<IoTrendingUpOutline className="h-4 w-4 text-muted-foreground" />
						</span>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{stats.totalProjects > 0
								? formatPercent(
										(stats.fundedProjects / stats.totalProjects) * 100,
									)
								: formatPercent(0)}
						</p>
						<p className="text-xs text-muted-foreground">
							{stats.fundedProjects} funded
						</p>
					</CardContent>
				</Card>
			</section>

			{/* Distribution charts */}
			<section className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<IoStatsChartOutline className="h-4 w-4" aria-hidden />
							Projects by status
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Distribution of campaign statuses
						</p>
					</CardHeader>
					<CardContent>
						{projectEntries.length > 0 ? (
							<div className="space-y-4">
								{projectEntries.map(([status, count]) => {
									const pct = (count / totalProjects) * 100
									return (
										<div key={status} className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="capitalize font-medium">{status}</span>
												<span className="tabular-nums text-muted-foreground">
													{count} ({formatPercent(pct)})
												</span>
											</div>
											<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
												<div
													className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
													style={{ width: `${Math.min(pct, 100)}%` }}
												/>
											</div>
										</div>
									)
								})}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								No project data yet
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<IoPeopleOutline className="h-4 w-4" aria-hidden />
							Users by role
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Distribution of user roles
						</p>
					</CardHeader>
					<CardContent>
						{userEntries.length > 0 ? (
							<div className="space-y-4">
								{userEntries.map(([role, count]) => {
									const pct = (count / totalUsers) * 100
									return (
										<div key={role} className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="capitalize font-medium">{role}</span>
												<span className="tabular-nums text-muted-foreground">
													{count} ({formatPercent(pct)})
												</span>
											</div>
											<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
												<div
													className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
													style={{ width: `${Math.min(pct, 100)}%` }}
												/>
											</div>
										</div>
									)
								})}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">No user data yet</p>
						)}
					</CardContent>
				</Card>
			</section>

			{/* Recent activity & foundations */}
			<section className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<IoStatsChartOutline className="h-4 w-4" aria-hidden />
							Last 7 days
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							New projects, users, foundations, and contributions
						</p>
					</CardHeader>
					<CardContent>
						<dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<div>
								<dt className="text-xs font-medium text-muted-foreground">
									Projects
								</dt>
								<dd className="mt-1 text-xl font-semibold tabular-nums">
									{stats.recentActivity.projects}
								</dd>
							</div>
							<div>
								<dt className="text-xs font-medium text-muted-foreground">
									Users
								</dt>
								<dd className="mt-1 text-xl font-semibold tabular-nums">
									{stats.recentActivity.users}
								</dd>
							</div>
							<div>
								<dt className="text-xs font-medium text-muted-foreground">
									Foundations
								</dt>
								<dd className="mt-1 text-xl font-semibold tabular-nums">
									{stats.recentActivity.foundations}
								</dd>
							</div>
							<div>
								<dt className="text-xs font-medium text-muted-foreground">
									Contributions
								</dt>
								<dd className="mt-1 text-xl font-semibold tabular-nums">
									{stats.recentActivity.contributions}
								</dd>
							</div>
						</dl>
						<p className="mt-4 text-sm text-muted-foreground">
							Contribution total:{' '}
							{formatCurrency(stats.recentActivity.contributionsAmount, 2)}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<IoBusinessOutline className="h-4 w-4" aria-hidden />
							Platform summary
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Foundations and funding progress
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Total foundations
							</span>
							<span className="text-lg font-semibold tabular-nums">
								{stats.totalFoundations}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Total escrows
							</span>
							<span className="text-lg font-semibold tabular-nums">
								{stats.totalEscrows}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Target (all projects)
							</span>
							<span className="text-lg font-semibold tabular-nums">
								{formatCurrency(stats.totalTarget)}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Active projects progress
							</span>
							<span className="text-lg font-semibold tabular-nums">
								{formatPercent(stats.activeProjectsProgress)}
							</span>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	)
}
