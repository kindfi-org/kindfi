'use client'

import { Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '~/components/base/badge'
import type { GovernanceOption, GovernanceRound } from '~/lib/governance/types'
import { cn } from '~/lib/utils'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'
import { GOVERNANCE_CONTRACT_ADDRESS, STATUS_CONFIG } from './constants'

interface RoundRowProps {
	round: GovernanceRound
}

export const RoundRow = ({ round }: RoundRowProps) => {
	const [expanded, setExpanded] = useState(false)
	const statusConfig = STATUS_CONFIG[round.status]
	const options = round.options ?? []
	const totalVotes = options.reduce((sum, o) => sum + (o.upvotes ?? 0) + (o.downvotes ?? 0), 0)

	return (
		<div className="border rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
			>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-medium text-sm">{round.title}</span>
						<Badge variant="outline" className={cn('text-xs', statusConfig.className)}>
							{statusConfig.label}
						</Badge>
						{round.contract_round_id != null ? (
							<a
								href={getStellarExplorerUrl(GOVERNANCE_CONTRACT_ADDRESS)}
								target="_blank"
								rel="noopener noreferrer"
								onClick={(e) => e.stopPropagation()}
								className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
							>
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								On-chain #{round.contract_round_id}
								<ExternalLink className="h-2.5 w-2.5" />
							</a>
						) : (
							<span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400">
								<span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
								Pending on-chain
							</span>
						)}
					</div>
					<div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
						<span className="flex items-center gap-1">
							<Calendar className="h-3 w-3" />
							{new Date(round.starts_at).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
							})}{' '}
							→{' '}
							{new Date(round.ends_at).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric',
							})}
						</span>
						<span>
							{options.length} option{options.length !== 1 ? 's' : ''}
						</span>
						<span>
							{totalVotes} vote{totalVotes !== 1 ? 's' : ''}
						</span>
						{round.total_fund_amount > 0 && (
							<span className="font-medium text-foreground">
								{Number(round.total_fund_amount).toLocaleString('en-US', {
									maximumFractionDigits: 0,
								})}{' '}
								{round.fund_currency}
							</span>
						)}
					</div>
				</div>
				{expanded ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
				)}
			</button>

			{expanded && options.length > 0 && (
				<div className="border-t px-4 py-3 space-y-2 bg-muted/20">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						Options
					</p>
					{options.map((opt: GovernanceOption) => (
						<div
							key={opt.id}
							className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-border/40 last:border-0"
						>
							<div className="min-w-0">
								<span className="font-medium">{opt.title}</span>
								{opt.project_slug && (
									<span className="text-xs text-muted-foreground ml-2">/{opt.project_slug}</span>
								)}
							</div>
							<div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
								<span>👍 {opt.upvotes}</span>
								<span>👎 {opt.downvotes}</span>
								{round.winner_option_id === opt.id && (
									<span className="text-yellow-600 font-semibold">🏆 Winner</span>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
