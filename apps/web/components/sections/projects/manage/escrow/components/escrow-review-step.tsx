'use client'

import { Badge } from '~/components/base/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { useEscrowForm } from '../context/escrow-form-context'

const truncateAddress = (value: string) =>
	value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-8)}` : value

export function EscrowReviewStep() {
	const { formData } = useEscrowForm()
	const isMulti = formData.selectedEscrowType === 'multi-release'

	const milestoneTotal = formData.milestones.reduce((sum, milestone) => {
		if ('amount' in milestone && typeof milestone.amount === 'number') {
			return sum + milestone.amount
		}
		return sum
	}, 0)

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">Escrow Summary</CardTitle>
					<CardDescription>Review these details before deploying on-chain.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary">{isMulti ? 'Multi-Release' : 'Single-Release'}</Badge>
						{typeof formData.platformFee === 'number' ? (
							<Badge variant="outline">Platform fee: {formData.platformFee}%</Badge>
						) : null}
					</div>

					<dl className="grid gap-3 sm:grid-cols-2">
						<div>
							<dt className="text-xs font-medium text-muted-foreground">Title</dt>
							<dd className="mt-1 text-sm font-medium break-words">{formData.title || '—'}</dd>
						</div>
						<div>
							<dt className="text-xs font-medium text-muted-foreground">Engagement ID</dt>
							<dd className="mt-1 text-sm break-all">{formData.engagementId || '—'}</dd>
						</div>
						<div className="sm:col-span-2">
							<dt className="text-xs font-medium text-muted-foreground">Description</dt>
							<dd className="mt-1 text-sm whitespace-pre-wrap break-words">
								{formData.description || '—'}
							</dd>
						</div>
						<div className="sm:col-span-2">
							<dt className="text-xs font-medium text-muted-foreground">Asset (Trustline)</dt>
							<dd className="mt-1 font-mono text-xs break-all">{formData.trustlineAddress}</dd>
						</div>
						{!isMulti && typeof formData.amount === 'number' ? (
							<div>
								<dt className="text-xs font-medium text-muted-foreground">Total Amount</dt>
								<dd className="mt-1 text-sm font-medium tabular-nums">{formData.amount}</dd>
							</div>
						) : null}
						{isMulti && milestoneTotal > 0 ? (
							<div>
								<dt className="text-xs font-medium text-muted-foreground">Milestone Total</dt>
								<dd className="mt-1 text-sm font-medium tabular-nums">{milestoneTotal}</dd>
							</div>
						) : null}
					</dl>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">Roles</CardTitle>
					<CardDescription>Wallet addresses assigned to each role.</CardDescription>
				</CardHeader>
				<CardContent>
					<dl className="grid gap-3 sm:grid-cols-2">
						{[
							['Approver', formData.approver],
							['Service Provider', formData.serviceProvider],
							['Release Signer', formData.releaseSigner],
							['Dispute Resolver', formData.disputeResolver],
							['Platform Address', formData.platformAddress],
							...(isMulti ? [] : [['Receiver', formData.receiver] as const]),
						].map(([label, value]) => (
							<div key={label}>
								<dt className="text-xs font-medium text-muted-foreground">{label}</dt>
								<dd className="mt-1 font-mono text-xs break-all" title={value}>
									{value ? truncateAddress(value) : '—'}
								</dd>
							</div>
						))}
					</dl>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">Milestones</CardTitle>
					<CardDescription>
						{formData.milestones.length} milestone{formData.milestones.length === 1 ? '' : 's'}{' '}
						defined.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{formData.milestones.map((milestone, index) => (
						<div key={milestone.id} className="rounded-lg border bg-muted/30 p-3">
							<p className="text-sm font-medium">
								Milestone {index + 1}: {milestone.description || 'Untitled'}
							</p>
							{'amount' in milestone && 'receiver' in milestone ? (
								<div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
									{typeof milestone.amount === 'number' ? (
										<span className="tabular-nums">Amount: {milestone.amount}</span>
									) : null}
									{milestone.receiver ? (
										<span className="font-mono" title={milestone.receiver}>
											Receiver: {truncateAddress(milestone.receiver)}
										</span>
									) : null}
								</div>
							) : null}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	)
}
