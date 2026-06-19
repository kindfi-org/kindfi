'use client'

import { ArrowRight, CreditCard, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
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

interface EtherfuseOnRampCardProps {
	walletAddress: string
	escrowId?: string
	onSuccess?: () => void
}

export function EtherfuseOnRampCard({
	walletAddress,
	escrowId,
	onSuccess,
}: EtherfuseOnRampCardProps) {
	const [amount, setAmount] = useState<number | ''>('')
	const [currency, setCurrency] = useState('MXN')
	const [targetAsset, setTargetAsset] = useState(
		'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
	) // Example USDC on Stellar
	const [isProcessing, setIsProcessing] = useState(false)
	const [statusPage, setStatusPage] = useState<string | null>(null)

	const handleOnRamp = async () => {
		if (!amount || Number(amount) <= 0) {
			toast.error('Please enter a valid amount')
			return
		}

		try {
			setIsProcessing(true)

			const response = await fetch('/api/etherfuse/on-ramp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: (await fetch('/api/auth/user').then((res) => res.json())).user.id,
					amount: String(amount),
					currency,
					targetAsset,
					walletAddress,
					escrowId,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create on-ramp order')
			}

			if (data.success) {
				setStatusPage(data.statusPage)
				toast.success('On-ramp order created successfully!', {
					description: 'Please complete the deposit using the provided instructions.',
				})
				setAmount('')
				onSuccess?.()
			}
		} catch (error) {
			logger.error('Etherfuse on-ramp error:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to create on-ramp order')
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-primary/10">
						<CreditCard className="w-5 h-5 text-primary" />
					</div>
					<div>
						<CardTitle>Fiat On-Ramp</CardTitle>
						<CardDescription>
							Fund your wallet using local fiat currency through Etherfuse
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{statusPage ? (
					<div className="space-y-4">
						<div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
							<p className="font-medium text-green-900 dark:text-green-100 mb-2">
								On-Ramp Order Created
							</p>
							<p className="text-sm text-green-800 dark:text-green-200 mb-4">
								Your on-ramp order has been created successfully. Please complete the deposit using
								the instructions on the status page.
							</p>
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
							<Label htmlFor="currency">Fiat Currency</Label>
							<Select value={currency} onValueChange={setCurrency} disabled={isProcessing}>
								<SelectTrigger id="currency">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="MXN">Mexican Peso (MXN)</SelectItem>
									<SelectItem value="USD">US Dollar (USD)</SelectItem>
									<SelectItem value="EUR">Euro (EUR)</SelectItem>
									<SelectItem value="BRL">Brazilian Real (BRL)</SelectItem>
									<SelectItem value="COP">Colombian Peso (COP)</SelectItem>
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
							<p className="text-xs text-muted-foreground">Enter the amount you want to deposit</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="target-asset">Target Asset</Label>
							<Select value={targetAsset} onValueChange={setTargetAsset} disabled={isProcessing}>
								<SelectTrigger id="target-asset">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D">
										USDC (Stellar)
									</SelectItem>
									<SelectItem value="CETES:GC3CW7...">CETES (Stellar)</SelectItem>
									<SelectItem value="USDx:G...">USDx (Stellar)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="rounded-lg border p-4 bg-muted/50">
							<div className="flex items-start gap-3">
								<div className="flex-1 space-y-1">
									<p className="text-sm font-medium">Destination Wallet</p>
									<p className="text-xs text-muted-foreground break-all">{walletAddress}</p>
								</div>
							</div>
						</div>

						<div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
							<p className="text-sm text-blue-900 dark:text-blue-100">
								<strong>Note:</strong> You will be redirected to Etherfuse to complete the deposit.
								The funds will be converted and sent to your wallet address.
							</p>
						</div>

						<Button
							onClick={handleOnRamp}
							disabled={!amount || Number(amount) <= 0 || isProcessing}
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
									Continue to Etherfuse
								</>
							)}
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	)
}
