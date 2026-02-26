'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { getAllEscrows } from '~/lib/queries/admin/get-all-escrows'
import { formatDistanceToNow } from '~/lib/utils/date-utils'

const formatCurrency = (value: number) =>
	new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value)

const SKELETON_KEYS = [
	'esc-sk-1',
	'esc-sk-2',
	'esc-sk-3',
	'esc-sk-4',
	'esc-sk-5',
] as const

export function AdminEscrowsList() {
	const {
		data: escrows,
		isLoading,
		error,
	} = useSupabaseQuery('admin-escrows', (client) => getAllEscrows(client), {})

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
					title="Escrows"
					description="View and monitor all escrow contracts on the platform"
				/>
				<Card className="border-destructive/50">
					<CardContent className="py-12 text-center">
						<p className="font-medium text-destructive">
							Error loading escrows.
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Refresh the page or try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	const stateColors: Record<string, string> = {
		NEW: 'bg-gray-100 text-gray-800',
		FUNDED: 'bg-blue-100 text-blue-800',
		ACTIVE: 'bg-green-200 text-green-800',
		COMPLETED: 'bg-purple-100 text-purple-800',
		DISPUTED: 'bg-red-100 text-red-800',
		CANCELLED: 'bg-orange-100 text-orange-800',
	}

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Escrows"
				description="View and monitor all escrow contracts on the platform"
			/>

			<div className="space-y-2">
				{escrows?.map((escrow) => (
					<Card key={escrow.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<span className="font-mono text-sm font-semibold">
											{escrow.contractId.slice(0, 20)}...
										</span>
										<Badge
											className={
												stateColors[escrow.currentState] ||
												'bg-gray-100 text-gray-800'
											}
										>
											{escrow.currentState}
										</Badge>
									</div>
									<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
										<span>Amount: {formatCurrency(escrow.amount)}</span>
										<span>•</span>
										<span>Fee: {escrow.platformFee}%</span>
										<span>•</span>
										{escrow.project && (
											<>
												<Link
													href={`/projects/${escrow.project.slug}`}
													className="text-blue-600 hover:text-blue-700 hover:underline"
												>
													{escrow.project.title}
												</Link>
												<span>•</span>
											</>
										)}
										<span>
											Created{' '}
											{escrow.createdAt
												? formatDistanceToNow(new Date(escrow.createdAt))
												: 'Unknown'}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{escrows?.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-muted-foreground">No escrows found.</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Escrow contracts will appear here when projects use escrow.
						</p>
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
