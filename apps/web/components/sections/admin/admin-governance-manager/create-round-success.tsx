'use client'

import { CheckCircle2, ExternalLink } from 'lucide-react'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'
import { GOVERNANCE_CONTRACT_ADDRESS } from './constants'
import type { CreateRoundResult } from './types'

interface CreateRoundSuccessProps {
	result: CreateRoundResult
}

export const CreateRoundSuccess = ({ result }: CreateRoundSuccessProps) => {
	return (
		<div className="py-6 space-y-4">
			<div className="flex flex-col items-center gap-3 text-center">
				<CheckCircle2 className="h-12 w-12 text-emerald-500" />
				<div>
					<p className="font-semibold text-base">Round created!</p>
					<p className="text-sm text-muted-foreground mt-1">
						{result.data.title}
					</p>
				</div>
			</div>

			<div className="rounded-lg border p-4 space-y-2 text-sm">
				{result.onChain && result.data.contract_round_id != null ? (
					<>
						<div className="flex items-center gap-2 text-emerald-700 font-medium">
							<span className="h-2 w-2 rounded-full bg-emerald-500" />
							Recorded on Stellar blockchain
						</div>
						<p className="text-muted-foreground text-xs">
							On-chain round ID:{' '}
							<span className="font-mono font-semibold text-foreground">
								#{result.data.contract_round_id}
							</span>
						</p>
						{GOVERNANCE_CONTRACT_ADDRESS && (
							<a
								href={getStellarExplorerUrl(GOVERNANCE_CONTRACT_ADDRESS)}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mt-1"
							>
								View governance contract on Stellar Expert
								<ExternalLink className="h-3 w-3" />
							</a>
						)}
					</>
				) : (
					<div className="flex items-center gap-2 text-amber-700">
						<span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
						<span className="text-xs">
							Saved to database — on-chain recording is pending (will retry
							automatically).
						</span>
					</div>
				)}
			</div>
		</div>
	)
}
