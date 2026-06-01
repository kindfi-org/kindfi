import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'

interface EscrowContractInfoProps {
	escrowContractAddress: string
}

export function EscrowContractInfo({ escrowContractAddress }: EscrowContractInfoProps) {
	return (
		<div className="p-3 my-4 text-sm bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1">
					<p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Escrow Contract</p>
					<p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
						All funds are secured in an on-chain escrow contract. You can audit the contract on
						Stellar Explorer.
					</p>
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
