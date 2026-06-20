'use client'

import { ArrowRight, ExternalLink, Landmark, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { useEtherfuseRampAssets } from '~/hooks/use-etherfuse-ramp-assets'

interface EtherfuseOffRampCardProps {
	walletAddress: string
	userId?: string
	defaultBankAccountId?: string
	escrowId?: string
	onSuccess?: () => void
}

export function EtherfuseOffRampCard({
	walletAddress,
	userId,
	defaultBankAccountId,
	escrowId,
	onSuccess,
}: EtherfuseOffRampCardProps) {
	const [amount, setAmount] = useState<number | ''>('')
	const [currency, setCurrency] = useState('MXN')
	const [sourceAsset, setSourceAsset] = useState('')
	const { data: assets = [], isLoading: isLoadingAssets } = useEtherfuseRampAssets(
		currency,
		walletAddress,
	)
	const [bankAccountId, setBankAccountId] = useState(defaultBankAccountId ?? '')
	const [isProcessing, setIsProcessing] = useState(false)
	const [statusPage, setStatusPage] = useState<string | null>(null)
	const [burnTransaction, setBurnTransaction] = useState<string | null>(null)

	useEffect(() => {
		if (assets.length === 0) {
			return
		}

		const hasSelectedAsset = assets.some((asset) => asset.identifier === sourceAsset)
		if (!hasSelectedAsset) {
			setSourceAsset(assets[0].identifier)
		}
	}, [assets, sourceAsset])

	const handleOffRamp = async () => {
		if (!amount || Number(amount) <= 0) {
			toast.error('Please enter a valid amount')
			return
		}

		if (!sourceAsset) {
			toast.error('Please select a source asset')
			return
		}

		if (!bankAccountId) {
			toast.error('Please select a bank account')
			return
		}

		try {
			setIsProcessing(true)

			const resolvedUserId =
				userId ?? (await fetch('/api/auth/user').then((res) => res.json())).user.id

			const response = await fetch('/api/etherfuse/off-ramp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: resolvedUserId,
					amount: String(amount),
					sourceAsset,
					currency,
					bankAccountId,
					walletAddress,
					escrowId,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create off-ramp order')
			}

			if (data.success) {
				setStatusPage(data.statusPage)
				setBurnTransaction(data.burnTransaction)
				toast.success('Off-ramp order created successfully!', {
					description: 'Please sign the burn transaction to complete the withdrawal.',
				})
				setAmount('')
				onSuccess?.()
			}
		} catch (error) {
			logger.error('Etherfuse off-ramp error:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to create off-ramp order')
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-primary/10">
						<Landmark className="w-5 h-5 text-primary" />
					</div>
					<div>
						<CardTitle>Fiat Off-Ramp</CardTitle>
						<CardDescription>
							Withdraw funds to your local bank account through Etherfuse
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{statusPage ? (
					<div className="space-y-4">
						<div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
							<p className="font-medium text-green-900 dark:text-green-100 mb-2">
								Off-Ramp Order Created
							</p>
							<p className="text-sm text-green-800 dark:text-green-200 mb-4">
								Your off-ramp order has been created successfully. Please sign the burn transaction
								to complete the withdrawal.
							</p>
							{burnTransaction && (
								<div className="mb-4">
									<p className="text-xs font-medium mb-2">Burn Transaction:</p>
									<p className="text-xs font-mono bg-muted p-2 rounded break-all">
										{burnTransaction}
									</p>
								</div>
							)}
							<Button
								onClick={() => window.open(statusPage, '_blank')}
								className="w-full"
								variant="outline"
							>
								<ExternalLink className="w-4 h-4 mr-2" />
								View Status Page
							</Button>
						</div>
						<Button onClick={() => setStatusPage(null)} variant="ghost" className="w-full">
							Create New Order
						</Button>
					</div>
				) : (
					<>
						<div className="space-y-2">
							<Label htmlFor="source-asset">Source Asset</Label>
							<Select
								value={sourceAsset}
								onValueChange={setSourceAsset}
								disabled={isProcessing || isLoadingAssets || assets.length === 0}
							>
								<SelectTrigger id="source-asset">
									<SelectValue placeholder={isLoadingAssets ? 'Loading assets…' : 'Select asset'} />
								</SelectTrigger>
								<SelectContent>
									{assets.map((asset) => (
										<SelectItem key={asset.identifier} value={asset.identifier}>
											{asset.symbol} · {asset.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">Amount</Label>
							<Input
								id="amount"
								type="number"
								value={amount}
								onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
								placeholder="0.00"
								min="0"
								step="0.01"
								className="text-lg"
								disabled={isProcessing}
							/>
							<p className="text-xs text-muted-foreground">Enter the amount you want to withdraw</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="currency">Fiat Currency</Label>
							<Select value={currency} onValueChange={setCurrency} disabled={isProcessing}>
								<SelectTrigger id="currency">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="MXN">Mexican Peso (MXN)</SelectItem>
									<SelectItem value="BRL">Brazilian Real (BRL)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{defaultBankAccountId ? (
							<div className="rounded-lg border p-4 bg-muted/50">
								<p className="text-sm font-medium">Bank Account</p>
								<p className="text-xs text-muted-foreground mt-1">
									Withdrawals will be sent to your linked Etherfuse bank account.
								</p>
							</div>
						) : (
							<div className="space-y-2">
								<Label htmlFor="bank-account">Bank Account</Label>
								<Select
									value={bankAccountId}
									onValueChange={setBankAccountId}
									disabled={isProcessing}
								>
									<SelectTrigger id="bank-account">
										<SelectValue placeholder="Select bank account" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="bank-1">Bank Account 1 (****1234)</SelectItem>
										<SelectItem value="bank-2">Bank Account 2 (****5678)</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">
									Select the bank account to receive funds
								</p>
							</div>
						)}

						<div className="rounded-lg border p-4 bg-muted/50">
							<div className="flex items-start gap-3">
								<div className="flex-1 space-y-1">
									<p className="text-sm font-medium">Source Wallet</p>
									<p className="text-xs text-muted-foreground break-all">{walletAddress}</p>
								</div>
							</div>
						</div>

						<div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
							<p className="text-sm text-blue-900 dark:text-blue-100">
								<strong>Note:</strong> You will need to sign a burn transaction to complete the
								withdrawal. The funds will be converted and sent to your selected bank account.
							</p>
						</div>

						<Button
							onClick={handleOffRamp}
							disabled={
								!amount || Number(amount) <= 0 || !sourceAsset || !bankAccountId || isProcessing
							}
							className="w-full"
							size="lg"
						>
							{isProcessing ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<ArrowRight className="w-4 h-4 mr-2" />
									Create Withdrawal Order
								</>
							)}
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	)
}
