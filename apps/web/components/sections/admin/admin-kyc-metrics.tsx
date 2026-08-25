'use client'

import { useState } from 'react'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import type { KycEnforcementMetrics } from '~/lib/kyc/metrics'
import type { KycEnforcementMode } from '~/lib/kyc/types'

interface AdminKycMetricsProps {
	mode: KycEnforcementMode
	metrics: KycEnforcementMetrics
}

const MODE_LABEL: Record<KycEnforcementMode, string> = {
	disabled: 'Disabled — no users are blocked; policy is not evaluated',
	monitor: 'Monitor — policy is evaluated and audited, users are never blocked',
	enforced: 'Enforced — configured actions require an approved Didit status',
}

const MetricTile = ({ label, value }: { label: string; value: number }) => (
	<div className="rounded-lg border border-border/60 bg-muted/20 p-4">
		<div className="text-2xl font-semibold">{value}</div>
		<div className="text-xs text-muted-foreground">{label}</div>
	</div>
)

export const AdminKycMetrics = ({ mode, metrics }: AdminKycMetricsProps) => {
	const [period, setPeriod] = useState(String(metrics.periodDays))

	return (
		<div className="space-y-8">
			<AdminSectionHeader
				title="Didit KYC enforcement"
				description="Monitor the impact of requiring Didit verification before turning enforcement on. Production stays disabled until KYC_ENFORCEMENT_MODE is changed and the app is redeployed."
			/>

			<div className="rounded-lg border border-border/60 p-4 text-sm">
				<p className="font-medium">Current mode</p>
				<p className="mt-1 text-muted-foreground">{MODE_LABEL[mode]}</p>
				<p className="mt-2 text-xs text-muted-foreground">
					Changing KYC_ENFORCEMENT_MODE or KYC_ENFORCED_ACTIONS requires a Vercel redeploy (or a
					process restart). The value is not hot-reloaded.
				</p>
			</div>

			<div className="flex items-center justify-between gap-4">
				<h2 className="text-sm font-medium">Last {metrics.periodDays} days</h2>
				<form method="get" className="flex items-center gap-2 text-sm">
					<label htmlFor="kyc-period">Period</label>
					<select
						id="kyc-period"
						name="days"
						value={period}
						onChange={(event) => {
							setPeriod(event.target.value)
							window.location.search = `?days=${event.target.value}`
						}}
						className="rounded-md border border-input bg-background px-2 py-1"
					>
						<option value="7">7 days</option>
						<option value="30">30 days</option>
						<option value="90">90 days</option>
					</select>
				</form>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<MetricTile
					label="Actions without approved KYC"
					value={metrics.actionsWithoutApprovedKyc}
				/>
				<MetricTile label="Would have blocked" value={metrics.wouldHaveBlocked} />
				<MetricTile
					label="Didit status-resolution failures"
					value={metrics.statusResolutionFailures}
				/>
				<MetricTile
					label="Didit sessions tracked"
					value={metrics.statusDistribution.reduce((sum, row) => sum + row.count, 0)}
				/>
			</div>

			<section className="space-y-3">
				<h2 className="text-sm font-medium">Results by financial action</h2>
				<div className="overflow-x-auto rounded-lg border border-border/60">
					<table className="w-full text-left text-sm">
						<thead className="bg-muted/40 text-xs text-muted-foreground">
							<tr>
								<th className="px-3 py-2 font-medium">Action</th>
								<th className="px-3 py-2 font-medium">Total</th>
								<th className="px-3 py-2 font-medium">Without approved KYC</th>
								<th className="px-3 py-2 font-medium">Would have blocked</th>
							</tr>
						</thead>
						<tbody>
							{metrics.byAction.map((row) => (
								<tr key={row.action} className="border-t border-border/50">
									<td className="px-3 py-2 font-mono text-xs">{row.action}</td>
									<td className="px-3 py-2">{row.total}</td>
									<td className="px-3 py-2">{row.withoutApprovedKyc}</td>
									<td className="px-3 py-2">{row.wouldHaveBlocked}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className="space-y-3">
				<h2 className="text-sm font-medium">Didit status distribution</h2>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{metrics.statusDistribution.length === 0 ? (
						<p className="text-sm text-muted-foreground">No Didit sessions stored yet.</p>
					) : (
						metrics.statusDistribution.map((row) => (
							<MetricTile key={row.status} label={row.status} value={row.count} />
						))
					)}
				</div>
			</section>

			<section className="space-y-3">
				<h2 className="text-sm font-medium">Trend</h2>
				{metrics.trends.length === 0 ? (
					<p className="text-sm text-muted-foreground">No authorization events in this period.</p>
				) : (
					<div className="overflow-x-auto rounded-lg border border-border/60">
						<table className="w-full text-left text-sm">
							<thead className="bg-muted/40 text-xs text-muted-foreground">
								<tr>
									<th className="px-3 py-2 font-medium">Date</th>
									<th className="px-3 py-2 font-medium">Without approved KYC</th>
									<th className="px-3 py-2 font-medium">Would have blocked</th>
								</tr>
							</thead>
							<tbody>
								{metrics.trends.map((row) => (
									<tr key={row.date} className="border-t border-border/50">
										<td className="px-3 py-2">{row.date}</td>
										<td className="px-3 py-2">{row.withoutApprovedKyc}</td>
										<td className="px-3 py-2">{row.wouldHaveBlocked}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	)
}
