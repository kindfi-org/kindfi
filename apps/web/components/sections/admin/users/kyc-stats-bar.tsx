'use client'

import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { Skeleton } from '~/components/base/skeleton'
import { useAdminCounts } from '~/hooks/admin/use-admin-counts'

interface KycStatsBarProps {
	activeKyc: string | undefined
	onSelect: (kyc: string | undefined) => void
}

const BUCKETS = [
	{ key: 'not_started', label: 'Not started' },
	{ key: 'pending', label: 'Pending review' },
	{ key: 'approved', label: 'Approved / verified' },
	{ key: 'rejected', label: 'Rejected' },
] as const

/**
 * KYC status distribution. Each card toggles the corresponding list filter.
 */
export function KycStatsBar({ activeKyc, onSelect }: KycStatsBarProps) {
	const { data, isLoading, isError, refetch } = useAdminCounts()
	const kyc = data?.stats?.kyc
	const countsUnavailable = isError || data?.statsError === true

	const handleKycSelect = (bucketKey: string, isActive: boolean) => {
		onSelect(isActive ? undefined : bucketKey)
	}

	if (countsUnavailable) {
		return (
			<div
				role="alert"
				className="flex items-center justify-between gap-3 rounded-lg border p-4"
				aria-label="KYC status distribution"
			>
				<p className="text-sm text-muted-foreground">KYC counts could not be loaded.</p>
				<Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
					Retry
				</Button>
			</div>
		)
	}

	return (
		<section aria-label="KYC status distribution" className="grid grid-cols-2 gap-3 md:grid-cols-4">
			{BUCKETS.map((bucket) => {
				const isActive = activeKyc === bucket.key
				const value = kyc?.[bucket.key]
				return (
					<Card key={bucket.key} className={isActive ? 'border-primary' : undefined}>
						<CardContent className="p-0">
							<button
								type="button"
								className="block w-full rounded-xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								onClick={() => handleKycSelect(bucket.key, isActive)}
								aria-pressed={isActive}
							>
								{isLoading || value === undefined ? (
									<Skeleton className="h-8 w-16" />
								) : (
									<p className="text-2xl font-semibold tabular-nums">
										{value.toLocaleString('en-US')}
									</p>
								)}
								<p className="mt-1 text-sm text-muted-foreground">{bucket.label}</p>
							</button>
						</CardContent>
					</Card>
				)
			})}
		</section>
	)
}
