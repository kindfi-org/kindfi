'use client'

import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import type { TransferFormData } from './use-smart-wallet-transfer'

export function TransferForm({
	formData,
	onChange,
	onSubmit,
	isLoading,
	smartWalletAddress,
}: {
	formData: TransferFormData
	onChange: (data: TransferFormData) => void
	onSubmit: () => void
	isLoading: boolean
	smartWalletAddress: string
}) {
	return (
		<div className="space-y-4">
			<div>
				<label htmlFor="to" className="block text-sm font-medium mb-2">
					Recipient Address
				</label>
				<Input
					id="to"
					type="text"
					placeholder="GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
					value={formData.to}
					onChange={(e) => onChange({ ...formData, to: e.target.value })}
					className="font-mono text-sm"
				/>
			</div>

			<div>
				<label htmlFor="amount" className="block text-sm font-medium mb-2">
					Amount (XLM)
				</label>
				<Input
					id="amount"
					type="number"
					step="0.0000001"
					placeholder="10.0"
					value={formData.amount}
					onChange={(e) => onChange({ ...formData, amount: e.target.value })}
				/>
			</div>

			<div>
				<label htmlFor="asset" className="block text-sm font-medium mb-2">
					Asset
				</label>
				<select
					id="asset"
					value={formData.asset}
					onChange={(e) => onChange({ ...formData, asset: e.target.value })}
					className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				>
					<option value="native">XLM (Native)</option>
					<option value="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5">
						USDC (Testnet)
					</option>
				</select>
			</div>

			<Button
				onClick={onSubmit}
				disabled={isLoading || !smartWalletAddress}
				className="w-full"
			>
				{isLoading ? 'Preparing...' : 'Prepare Transfer'}
			</Button>
			{!smartWalletAddress && (
				<p className="text-xs text-muted-foreground text-center">
					Please wait for your smart wallet to initialize...
				</p>
			)}
		</div>
	)
}
