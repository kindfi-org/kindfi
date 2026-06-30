'use client'

import { Check, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { truncateAddress } from '~/lib/utils/escrow/milestone-utils'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'

interface EscrowContractInfoProps {
	escrowContractAddress: string
}

export function EscrowContractInfo({ escrowContractAddress }: EscrowContractInfoProps) {
	const [copied, setCopied] = useState(false)

	const handleCopyAddress = async () => {
		try {
			await navigator.clipboard.writeText(escrowContractAddress)
			setCopied(true)
			toast.success('Escrow address copied')
			setTimeout(() => setCopied(false), 2000)
		} catch {
			toast.error('Failed to copy address')
		}
	}

	return (
		<div className="p-3 my-4 text-sm bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Escrow Contract</p>
					<p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
						All funds are secured in an on-chain escrow contract. To donate without a KindFi
						account, send USDC directly to the escrow contract address below.
					</p>
					<div className="flex items-center gap-2">
						<code className="text-xs font-mono text-blue-900 dark:text-blue-100 truncate">
							{truncateAddress(escrowContractAddress, 10)}
						</code>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-7 w-7 shrink-0 p-0"
							onClick={handleCopyAddress}
							aria-label="Copy escrow contract address"
						>
							{copied ? (
								<Check className="h-3.5 w-3.5 text-green-600" />
							) : (
								<Copy className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
							)}
						</Button>
					</div>
				</div>
				<Button variant="ghost" size="sm" asChild className="h-auto p-2 flex-shrink-0">
					<Link
						href={getStellarExplorerUrl(escrowContractAddress)}
						target="_blank"
						rel="noopener noreferrer"
						title="View escrow contract on Stellar Explorer"
					>
						<ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
					</Link>
				</Button>
			</div>
		</div>
	)
}
