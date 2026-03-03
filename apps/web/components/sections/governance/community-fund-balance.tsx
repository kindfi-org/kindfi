'use client'

import { useQuery } from '@tanstack/react-query'
import { ExternalLink, RefreshCw, TrendingUp, Vault } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import type { CommunityFundBalance as CommunityFundBalanceData } from '~/lib/governance/types'
import { getStellarExplorerAddressUrl } from '~/lib/utils/escrow/stellar-explorer'

interface BalanceApiResponse {
	success: boolean
	data: CommunityFundBalanceData
	error?: string
}

export function CommunityFundBalance() {
	const { data, isLoading, isError, refetch, isFetching } =
		useQuery<BalanceApiResponse>({
			queryKey: ['community-fund-balance'],
			queryFn: async () => {
				const res = await fetch('/api/governance/balance')
				if (!res.ok) throw new Error('Failed to fetch balance')
				return res.json()
			},
			refetchInterval: 60_000,
			staleTime: 30_000,
		})

	const balance = data?.data
	const currency = process.env.NEXT_PUBLIC_COMMUNITY_FUND_CURRENCY ?? 'USDC'

	return (
		<Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 h-full">
			<CardContent className="p-6">
				<div className="flex items-start gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
						<Vault className="h-6 w-6 text-primary" />
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Community Fund
							</p>
							<Badge
								variant="outline"
								className="text-[10px] px-1.5 py-0 h-4 font-normal border-primary/30 text-primary"
							>
								Live
							</Badge>
							<button
								type="button"
								onClick={() => refetch()}
								disabled={isFetching}
								className="ml-auto p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
								aria-label="Refresh balance"
							>
								<RefreshCw
									className={`h-3.5 w-3.5 text-muted-foreground ${isFetching ? 'animate-spin' : ''}`}
								/>
							</button>
						</div>

						{isLoading ? (
							<div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
						) : isError ? (
							<p className="text-sm text-destructive">Failed to load balance</p>
						) : (
							<>
								<div className="flex items-baseline gap-2 flex-wrap">
									<span className="text-2xl font-bold tracking-tight tabular-nums">
										{Number(balance?.balance ?? 0).toLocaleString('en-US', {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</span>
									<span className="text-base font-semibold text-muted-foreground">
										{currency}
									</span>
									<span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
										<TrendingUp className="h-3 w-3" />
										Escrow
									</span>
								</div>

								{balance?.address && (
									<div className="flex items-center gap-2 mt-2">
										<code className="text-[11px] text-muted-foreground font-mono">
											{balance.address.slice(0, 6)}…
											{balance.address.slice(-4)}
										</code>
										<a
											href={getStellarExplorerAddressUrl(balance.address)}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
										>
											<ExternalLink className="h-2.5 w-2.5" />
											Verify
										</a>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
