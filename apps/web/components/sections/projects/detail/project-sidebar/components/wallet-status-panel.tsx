'use client'

import { Button } from '~/components/base/button'

interface WalletStatusPanelProps {
	isMounted: boolean
	isConnected: boolean
	walletName: string | null | undefined
	address: string | null | undefined
	onConnect: () => void
	onDisconnect: () => void
}

export function WalletStatusPanel({
	isMounted,
	isConnected,
	walletName,
	address,
	onConnect,
	onDisconnect,
}: WalletStatusPanelProps) {
	return (
		<div className="p-3 mt-4 text-sm rounded-md border border-gray-200">
			<div className="flex justify-between items-center mb-2">
				<span className="font-medium">Donor details</span>
				{isMounted ? (
					<span className={isConnected ? 'text-green-600' : 'text-red-600'}>
						{isConnected ? 'Connected' : 'Not connected'}
					</span>
				) : (
					<span className="text-muted-foreground">Checking…</span>
				)}
			</div>
			{isMounted ? (
				isConnected ? (
					<div className="text-gray-700 break-all">
						<p className="mb-1">{walletName || 'Wallet'}</p>
						<p className="text-xs">{address}</p>
						<Button variant="outline" size="sm" className="mt-3" onClick={onDisconnect}>
							Disconnect wallet
						</Button>
					</div>
				) : (
					<Button variant="outline" size="sm" onClick={onConnect}>
						Connect wallet
					</Button>
				)
			) : (
				<div className="h-9 rounded border border-gray-200 bg-gray-50 animate-pulse" />
			)}
		</div>
	)
}
