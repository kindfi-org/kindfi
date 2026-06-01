'use client'

import { Button } from '~/components/base/button'
import type { useSmartWalletTransfer } from './use-smart-wallet-transfer'

type SmartWalletActions = ReturnType<
	typeof useSmartWalletTransfer
>['smartWalletActions']

export function WalletInfoPanel({
	smartWalletAddress,
	smartWalletActions,
	isApproving,
	isLoading,
	isFunding,
	balance,
	onApprove,
	onFetchBalance,
	onFund,
}: {
	smartWalletAddress: string
	smartWalletActions: SmartWalletActions
	isApproving: boolean
	isLoading: boolean
	isFunding: boolean
	balance: string | null
	onApprove: () => void
	onFetchBalance: () => void
	onFund: () => void
}) {
	return (
		<div className="rounded-lg bg-muted p-4">
			<div className="text-sm font-medium mb-2">Your Smart Wallet</div>
			<div className="text-xs font-mono break-all text-muted-foreground mb-2">
				{smartWalletAddress || 'Not initialized'}
			</div>
			{smartWalletAddress && (
				<a
					href={`https://stellar.expert/explorer/testnet/account/${smartWalletAddress}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs text-blue-600 hover:underline mb-3 inline-block"
				>
					View on Stellar Explorer →
				</a>
			)}
			{smartWalletActions.isLoading && (
				<div className="text-xs text-muted-foreground mb-2">
					⏳ Initializing account...
				</div>
			)}
			{smartWalletActions.error && (
				<div className="text-xs text-red-600 mb-2">
					❌ {smartWalletActions.error}
				</div>
			)}
			{smartWalletActions.isReady && (
				<div className="text-xs text-green-600 mb-2">✅ Account ready</div>
			)}
			<div className="mt-3 flex items-center gap-2 flex-wrap">
				<Button
					size="sm"
					variant="outline"
					onClick={onApprove}
					disabled={isApproving || !smartWalletAddress}
				>
					{isApproving ? 'Approving...' : 'Approve Account'}
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={onFetchBalance}
					disabled={isLoading || !smartWalletAddress}
				>
					{isLoading ? 'Loading...' : 'Check Balance'}
				</Button>
				<Button
					size="sm"
					variant="secondary"
					onClick={onFund}
					disabled={isFunding || !smartWalletAddress}
				>
					{isFunding ? 'Funding...' : '💰 Fund Wallet (10 XLM)'}
				</Button>
				{balance && (
					<span className="text-sm font-medium bg-green-50 dark:bg-green-950 px-3 py-1 rounded-md">
						{balance} XLM
					</span>
				)}
			</div>
		</div>
	)
}
