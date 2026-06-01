'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { SmartWalletFeaturesCard } from './smart-wallet-transfer-demo/features-card'
import { TransferForm } from './smart-wallet-transfer-demo/transfer-form'
import { useSmartWalletTransfer } from './smart-wallet-transfer-demo/use-smart-wallet-transfer'
import { WalletInfoPanel } from './smart-wallet-transfer-demo/wallet-info-panel'

export function SmartWalletTransferDemo() {
	const {
		formData,
		setFormData,
		isLoading,
		isFunding,
		isApproving,
		balance,
		smartWalletAddress,
		smartWalletActions,
		approveAccount,
		fundWallet,
		fetchBalance,
		prepareTransfer,
	} = useSmartWalletTransfer()

	return (
		<div className="space-y-6 max-w-2xl mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle>Smart Wallet Transfer Demo</CardTitle>
					<CardDescription>
						Transfer XLM and Stellar Assets using WebAuthn authentication
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<WalletInfoPanel
						smartWalletAddress={smartWalletAddress}
						smartWalletActions={smartWalletActions}
						isApproving={isApproving}
						isLoading={isLoading}
						isFunding={isFunding}
						balance={balance}
						onApprove={approveAccount}
						onFetchBalance={fetchBalance}
						onFund={() => fundWallet('10')}
					/>

					<TransferForm
						formData={formData}
						onChange={setFormData}
						onSubmit={prepareTransfer}
						isLoading={isLoading}
						smartWalletAddress={smartWalletAddress}
					/>

					<div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 text-sm">
						<div className="font-medium mb-1 flex items-center gap-2">
							💰 Testnet Faucet
						</div>
						<div className="text-muted-foreground">
							Your smart wallet needs XLM to pay for transactions. Use the
							&quot;Fund Wallet&quot; button to get testnet XLM for testing. This
							only works on Stellar Testnet.
						</div>
					</div>

					<div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
						<div className="font-medium mb-1">🔐 WebAuthn Signing</div>
						<div className="text-muted-foreground">
							Transactions require biometric authentication (fingerprint/Face ID)
							for security. Fee sponsorship is enabled for better UX.
						</div>
					</div>
				</CardContent>
			</Card>

			<SmartWalletFeaturesCard />
		</div>
	)
}
