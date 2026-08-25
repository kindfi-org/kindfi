'use client'

import Link from 'next/link'
import { Card, CardContent } from '~/components/base/card'
import { formatCurrency } from '~/components/sections/admin/admin-overview/formatters'
import type { AdminDashboardStats } from '~/lib/validators/admin-dashboard-stats'

interface MetricCard {
	label: string
	value: string
	href: string
	detail?: string
}

/** UTC date string N days ago, matching the users list `from` filter. */
function isoDaysAgo(days: number): string {
	const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
	return date.toISOString().slice(0, 10)
}

function buildMetricGroups(stats: AdminDashboardStats): Array<{
	title: string
	metrics: MetricCard[]
}> {
	const projectStatus = (status: string) => stats.projects.by_status[status] ?? 0
	const escrowState = (state: string) => stats.escrows.by_state[state] ?? 0
	const number = (value: number) => value.toLocaleString('en-US')

	return [
		{
			title: 'Users & KYC',
			metrics: [
				{ label: 'Total users', value: number(stats.users.total), href: '/admin/users' },
				{
					label: 'New today',
					value: number(stats.users.new_today),
					href: `/admin/users?sort=newest&from=${isoDaysAgo(0)}`,
				},
				{
					label: 'New this week',
					value: number(stats.users.new_week),
					href: `/admin/users?sort=newest&from=${isoDaysAgo(7)}`,
				},
				{
					label: 'New this month',
					value: number(stats.users.new_month),
					href: `/admin/users?sort=newest&from=${isoDaysAgo(30)}`,
				},
				{
					label: 'KYC not started',
					value: number(stats.kyc.not_started),
					href: '/admin/users?kyc=not_started',
				},
				{
					label: 'KYC pending',
					value: number(stats.kyc.pending),
					href: '/admin/users?kyc=pending',
				},
				{
					label: 'KYC approved',
					value: number(stats.kyc.approved),
					href: '/admin/users?kyc=approved',
				},
				{
					label: 'KYC rejected',
					value: number(stats.kyc.rejected),
					href: '/admin/users?kyc=rejected',
				},
			],
		},
		{
			title: 'Projects',
			metrics: [
				{ label: 'All projects', value: number(stats.projects.total), href: '/admin/projects' },
				{
					label: 'Draft',
					value: number(projectStatus('draft')),
					href: '/admin/projects?status=draft',
				},
				{
					label: 'Awaiting review',
					value: number(projectStatus('review')),
					href: '/admin/projects?status=review',
				},
				{
					label: 'Active',
					value: number(projectStatus('active')),
					href: '/admin/projects?status=active',
				},
				{
					label: 'Paused',
					value: number(projectStatus('paused')),
					href: '/admin/projects?status=paused',
				},
				{
					label: 'Funded',
					value: number(projectStatus('funded')),
					href: '/admin/projects?status=funded',
				},
				{
					label: 'Rejected',
					value: number(projectStatus('rejected')),
					href: '/admin/projects?status=rejected',
				},
				{
					label: 'Without escrow',
					value: number(stats.projects.without_escrow),
					href: '/admin/projects?escrow=none&status=active',
				},
			],
		},
		{
			title: 'Escrows',
			metrics: [
				{ label: 'Total escrows', value: number(stats.escrows.total), href: '/admin/escrows' },
				{ label: 'New', value: number(escrowState('NEW')), href: '/admin/escrows?state=NEW' },
				{
					label: 'Funded',
					value: number(escrowState('FUNDED')),
					href: '/admin/escrows?state=FUNDED',
				},
				{
					label: 'Active',
					value: number(escrowState('ACTIVE')),
					href: '/admin/escrows?state=ACTIVE',
				},
				{
					label: 'Completed',
					value: number(escrowState('COMPLETED')),
					href: '/admin/escrows?state=COMPLETED',
				},
				{
					label: 'Disputed',
					value: number(escrowState('DISPUTED')),
					href: '/admin/escrows?state=DISPUTED',
				},
				{
					label: 'Cancelled',
					value: number(escrowState('CANCELLED')),
					href: '/admin/escrows?state=CANCELLED',
				},
			],
		},
		{
			title: 'Operations',
			metrics: [
				{
					label: 'Pending milestone reviews',
					value: number(stats.milestone_reviews.pending),
					href: '/admin/milestone-reviews',
				},
				{
					label: 'Contributions',
					value: number(stats.contributions.count),
					detail: formatCurrency(stats.contributions.total_amount),
					href: '/admin/analytics',
				},
				{
					label: 'Foundations',
					value: number(stats.foundations.total),
					href: '/admin/foundations',
				},
				{
					label: 'Governance rounds',
					value: number(stats.governance.rounds_total),
					detail: `${number(stats.governance.rounds_active)} active`,
					href: '/admin/governance',
				},
			],
		},
	]
}

interface MetricGridProps {
	stats: AdminDashboardStats
}

/**
 * Platform metrics organized below the action center. Every card links to a
 * pre-filtered management view instead of being a read-only number.
 */
export function MetricGrid({ stats }: MetricGridProps) {
	const groups = buildMetricGroups(stats)

	return (
		<div className="space-y-6">
			{groups.map((group) => (
				<section key={group.title} aria-label={group.title}>
					<h3 className="mb-2 text-sm font-semibold text-muted-foreground">{group.title}</h3>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
						{group.metrics.map((metric) => (
							<Card key={metric.label} className="transition-colors hover:border-primary/50">
								<CardContent className="p-0">
									<Link
										href={metric.href}
										className="block rounded-xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									>
										<p className="text-2xl font-semibold tabular-nums">{metric.value}</p>
										<p className="mt-1 truncate text-sm text-muted-foreground">{metric.label}</p>
										{metric.detail ? (
											<p className="mt-0.5 truncate text-xs text-muted-foreground">
												{metric.detail}
											</p>
										) : null}
									</Link>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			))}
		</div>
	)
}
