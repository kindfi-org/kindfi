'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import Link from 'next/link'
import { Card, CardContent } from '~/components/base/card'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { getAllFoundations } from '~/lib/queries/foundations/get-all-foundations'
import { formatDistanceToNow } from '~/lib/utils/date-utils'

const formatCurrency = (value: number) =>
	new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value)

const SKELETON_KEYS = [
	'fdn-sk-1',
	'fdn-sk-2',
	'fdn-sk-3',
	'fdn-sk-4',
	'fdn-sk-5',
] as const

export function AdminFoundationsList() {
	const {
		data: foundations,
		isLoading,
		error,
	} = useSupabaseQuery(
		'admin-foundations',
		(client) => getAllFoundations(client, 'most-recent', 1000),
		{},
	)

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<div className="h-8 w-56 bg-muted animate-pulse rounded" />
					<div className="mt-2 h-4 w-72 bg-muted animate-pulse rounded" />
				</div>
				<div className="space-y-2">
					{SKELETON_KEYS.map((key) => (
						<div
							key={key}
							className="h-20 rounded-lg bg-muted/60 animate-pulse"
						/>
					))}
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="space-y-6">
				<AdminSectionHeader
					title="Foundations"
					description="View and manage all foundations on the platform"
				/>
				<Card className="border-destructive/50">
					<CardContent className="py-12 text-center">
						<p className="font-medium text-destructive">
							Error loading foundations.
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Refresh the page or try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Foundations"
				description="View and manage all foundations on the platform"
			/>

			<div className="space-y-2">
				{foundations?.map((foundation) => {
					const yearFounded =
						foundation.foundedYear > 0 ? foundation.foundedYear : null

					return (
						<Card
							key={foundation.id}
							className="hover:shadow-md transition-shadow"
						>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<Link
												href={`/foundations/${foundation.slug}`}
												className="font-semibold hover:underline"
											>
												{foundation.name}
											</Link>
										</div>
										<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
											{yearFounded != null ? (
												<>
													<span>Founded {yearFounded}</span>
													<span>•</span>
												</>
											) : null}
											<span>
												{formatCurrency(foundation.totalDonationsReceived)}{' '}
												donations
											</span>
											<span>•</span>
											<span>
												{foundation.totalCampaignsCompleted} completed,{' '}
												{foundation.totalCampaignsOpen} active campaigns
											</span>
											<span>•</span>
											<span>
												{foundation.createdAt
													? formatDistanceToNow(new Date(foundation.createdAt))
													: 'Unknown'}
											</span>
										</div>
										{foundation.founder && (
											<div className="text-xs text-muted-foreground mt-1">
												Founded by:{' '}
												{foundation.founder.displayName || 'Anonymous'}
											</div>
										)}
									</div>
									<div className="flex gap-2">
										<Link
											href={`/foundations/${foundation.slug}/manage`}
											className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
										>
											Manage
										</Link>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			{foundations?.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-muted-foreground">No foundations found.</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Foundations will appear here once they are created.
						</p>
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
