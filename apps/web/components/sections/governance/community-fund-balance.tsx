'use client'

import { useQuery } from '@tanstack/react-query'
import { ExternalLink, RefreshCw, Vault } from 'lucide-react'
import { Button } from '~/components/base/button'
import type { CommunityFundBalance as CommunityFundBalanceData } from '~/lib/governance/types'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'
import { getStellarExplorerAddressUrl } from '~/lib/utils/escrow/stellar-explorer'

interface BalanceApiResponse {
	success: boolean
	data: CommunityFundBalanceData
	error?: string
}

export function CommunityFundBalance() {
	const { t } = useI18n()
	const { data, isLoading, isError, refetch, isFetching } = useQuery<BalanceApiResponse>({
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
		<div className="h-full rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm shadow-slate-200/50">
			<div className="flex items-start gap-4">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
					<Vault className="h-6 w-6" aria-hidden="true" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="mb-3 flex items-start justify-between gap-3">
						<div>
							<p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
								{t('governancePage.fundLabel')}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{t('governancePage.fundSubtitle')}
							</p>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => refetch()}
							disabled={isFetching}
							className="h-8 rounded-full px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
							aria-label={t('governancePage.fundRefresh')}
						>
							<RefreshCw
								className={cn('h-4 w-4', isFetching && 'animate-spin')}
								aria-hidden="true"
							/>
						</Button>
					</div>

					{isLoading ? (
						<div className="h-10 w-44 animate-pulse rounded-xl bg-emerald-50" />
					) : isError ? (
						<p className="text-sm text-destructive">{t('governancePage.fundLoadError')}</p>
					) : (
						<>
							<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
								<span className="text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
									{Number(balance?.balance ?? 0).toLocaleString('en-US', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
								<span className="text-base font-semibold text-slate-500">{currency}</span>
							</div>

							{balance?.address ? (
								<div className="mt-4 flex flex-wrap items-center gap-2">
									<code className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-mono text-slate-500">
										{balance.address.slice(0, 6)}…{balance.address.slice(-4)}
									</code>
									<a
										href={getStellarExplorerAddressUrl(balance.address)}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
									>
										<ExternalLink className="h-3 w-3" aria-hidden="true" />
										{t('governancePage.fundVerify')}
									</a>
								</div>
							) : null}
						</>
					)}
				</div>
			</div>
		</div>
	)
}
