import { SmartWalletTransferDemo } from '~/components/shared/smart-wallet-transfer-demo'

export const metadata = {
	title: 'Smart Wallet Demo | KindFi',
	description: 'Test smart wallet transactions with WebAuthn authentication',
}

export default function SmartWalletDemoPage() {
	return (
		<div className="container py-10">
			<div className="max-w-3xl mx-auto space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">
						Smart Wallet Transaction Demo
					</h1>
					<p className="text-muted-foreground">
						Test XLM and Stellar Asset transfers with WebAuthn authentication
					</p>
				</div>

				<SmartWalletTransferDemo />

				<div className="rounded-lg border p-6 space-y-4">
					<h2 className="text-lg font-semibold">API Endpoints</h2>
					<div className="space-y-3 text-sm">
						<div>
							<code className="px-2 py-1 bg-muted rounded text-xs">
								POST /api/stellar/transfer/prepare
							</code>
							<p className="text-muted-foreground mt-1">
								Build transfer transaction for WebAuthn signing
							</p>
						</div>
						<div>
							<code className="px-2 py-1 bg-muted rounded text-xs">
								POST /api/stellar/transfer/submit
							</code>
							<p className="text-muted-foreground mt-1">
								Submit signed transaction to network
							</p>
						</div>
						<div>
							<code className="px-2 py-1 bg-muted rounded text-xs">
								GET /api/stellar/balances/[address]
							</code>
							<p className="text-muted-foreground mt-1">
								Query smart wallet balances
							</p>
						</div>
						<div>
							<code className="px-2 py-1 bg-muted rounded text-xs">
								POST /api/stellar/contract/invoke
							</code>
							<p className="text-muted-foreground mt-1">
								Invoke arbitrary contract functions
							</p>
						</div>
						<div>
							<code className="px-2 py-1 bg-muted rounded text-xs">
								POST /api/stellar/devices
							</code>
							<p className="text-muted-foreground mt-1">
								Execute passkey device operations
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-6">
					<h3 className="font-semibold mb-2">⚠️ Testnet Only</h3>
					<p className="text-sm text-muted-foreground">
						This demo uses Stellar Testnet. No real funds are at risk. Get free
						testnet XLM from{' '}
						<a
							href="https://laboratory.stellar.org/#account-creator?network=test"
							target="_blank"
							rel="noopener noreferrer"
							className="underline hover:text-foreground"
						>
							Stellar Laboratory
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}
