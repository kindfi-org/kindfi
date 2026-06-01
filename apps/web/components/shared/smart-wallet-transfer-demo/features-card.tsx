'use client'

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'

export function SmartWalletFeaturesCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Supported Operations</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<div className="font-medium">✅ Transfers</div>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• Send XLM to any address</li>
							<li>• Send Stellar Assets (USDC, EURC)</li>
							<li>• Fee sponsorship available</li>
						</ul>
					</div>
					<div className="space-y-2">
						<div className="font-medium">✅ Receiving</div>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• Receive from exchanges</li>
							<li>• Receive from onramp providers</li>
							<li>• Receive from other wallets</li>
						</ul>
					</div>
					<div className="space-y-2">
						<div className="font-medium">✅ Smart Contracts</div>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• Invoke DeFi protocols</li>
							<li>• Mint NFTs</li>
							<li>• Custom contract calls</li>
						</ul>
					</div>
					<div className="space-y-2">
						<div className="font-medium">✅ Security</div>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• WebAuthn authentication</li>
							<li>• On-chain verification</li>
							<li>• Multi-device support</li>
						</ul>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
