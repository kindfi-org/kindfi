'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { DollarSign, Info, Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { Alert, AlertDescription } from '~/components/base/alert'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { EtherfuseOnRampCard } from '../components/etherfuse-on-ramp-card'

const QUICK_AMOUNTS = [100, 500, 1000, 5000]

interface FundEscrowTabProps {
	escrowContractAddress: string
	escrowType: EscrowType
	balance: number | null
	isLoadingBalance: boolean
	onSuccess: () => void
}

export function FundEscrowTab({
	escrowContractAddress,
	escrowType,
	balance,
	isLoadingBalance,
	onSuccess,
}: FundEscrowTabProps) {
	const { fundEscrow, sendTransaction } = useEscrow()
	const { ensureTrustlessSigner, signTrustlessTransaction } = useTrustlessSigner()
	const [fundAmount, setFundAmount] = useState<number | ''>('')
	const [isProcessing, setIsProcessing] = useState(false)

	const handleFundEscrow = async () => {
		if (!fundAmount || Number(fundAmount) <= 0) {
			toast.error('Enter a valid amount greater than zero')
			return
		}

		const amount = Number(fundAmount)

		if (amount > 1_000_000) {
			toast.error('Amount too large', {
				description: 'Enter an amount less than $1,000,000',
			})
			return
		}

		try {
			setIsProcessing(true)
			const signer = await ensureTrustlessSigner()

			const fundResponse = await fundEscrow(
				{
					amount,
					contractId: escrowContractAddress,
					signer,
				},
				escrowType,
			)

			if (fundResponse.status !== 'SUCCESS' || !fundResponse.unsignedTransaction) {
				throw new Error('Failed to prepare funding transaction')
			}

			const signedXdr = await signTrustlessTransaction(fundResponse.unsignedTransaction)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Escrow funded successfully', {
				description: `Added $${amount.toLocaleString()} to the escrow.`,
			})

			setFundAmount('')
			onSuccess()
		} catch (error) {
			logger.error('Fund escrow error:', error)

			let errorMessage = ''
			let apiErrorMessage = ''

			if (error instanceof Error) {
				errorMessage = error.message
			} else if (typeof error === 'object' && error !== null) {
				if ('response' in error && error.response) {
					const response = error.response as {
						data?: { message?: string; error?: string }
					}
					if (response.data?.message) {
						apiErrorMessage = response.data.message
					} else if (response.data?.error) {
						apiErrorMessage = response.data.error
					}
				}
				errorMessage = String(error)
			} else {
				errorMessage = String(error)
			}

			const combinedMessage = `${errorMessage} ${apiErrorMessage}`.toLowerCase()

			let userFriendlyMessage = 'Failed to fund escrow'

			if (
				combinedMessage.includes('storage, missingvalue') ||
				combinedMessage.includes('missingvalue') ||
				(combinedMessage.includes('balance') && combinedMessage.includes('non-existing'))
			) {
				userFriendlyMessage =
					'Your wallet needs a trustline for this token before funding. Approve the token in your wallet first.'
			} else if (
				combinedMessage.includes('insufficient funds') ||
				combinedMessage.includes('sufficient funds')
			) {
				userFriendlyMessage = 'Insufficient token balance in your connected wallet.'
			} else if (combinedMessage.includes('trustline')) {
				userFriendlyMessage =
					'Trustline required. Establish a trustline for this token in your wallet.'
			} else if (apiErrorMessage) {
				userFriendlyMessage = apiErrorMessage
			}

			toast.error(userFriendlyMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2">
						<DollarSign className="h-5 w-5 text-primary" aria-hidden="true" />
					</div>
					<div>
						<CardTitle>Fund Escrow</CardTitle>
						<CardDescription>
							Deposit USDC from your connected wallet or use fiat on-ramp.
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="crypto" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="crypto">Crypto</TabsTrigger>
						<TabsTrigger value="fiat">Fiat On-Ramp</TabsTrigger>
					</TabsList>
					<TabsContent value="crypto" className="mt-6 space-y-6">
						<div className="rounded-lg border bg-muted/40 p-4">
							<p className="text-sm font-medium">Current Balance</p>
							<p className="mt-1 text-2xl font-bold tabular-nums">
								{isLoadingBalance ? (
									<span className="text-base text-muted-foreground">Loading…</span>
								) : balance !== null ? (
									`$${balance.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 7,
									})}`
								) : (
									'N/A'
								)}
							</p>
						</div>

						<div className="space-y-3">
							<Label htmlFor="fund-amount" className="text-base font-medium">
								Amount to Add (USDC)
							</Label>
							<Input
								id="fund-amount"
								name="fund-amount"
								type="number"
								inputMode="decimal"
								autoComplete="off"
								value={fundAmount}
								onChange={(e) => setFundAmount(e.target.value === '' ? '' : Number(e.target.value))}
								placeholder="0.00…"
								min="0"
								step="0.01"
								className="text-lg tabular-nums"
								disabled={isProcessing}
							/>
							<div className="flex flex-wrap gap-2">
								{QUICK_AMOUNTS.map((amount) => (
									<Button
										key={amount}
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setFundAmount(amount)}
										disabled={isProcessing}
									>
										${amount.toLocaleString()}
									</Button>
								))}
							</div>
						</div>

						<Alert>
							<Info className="h-4 w-4" aria-hidden="true" />
							<AlertDescription>
								Your wallet must hold enough USDC and have the token trustline enabled. You will
								sign the funding transaction with your connected external wallet.
							</AlertDescription>
						</Alert>

						<Button
							type="button"
							onClick={handleFundEscrow}
							disabled={!fundAmount || Number(fundAmount) <= 0 || isProcessing}
							className="w-full"
							size="lg"
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
									Funding…
								</>
							) : (
								<>
									<Send className="mr-2 h-4 w-4" aria-hidden="true" />
									Fund Escrow
								</>
							)}
						</Button>
					</TabsContent>
					<TabsContent value="fiat" className="mt-6">
						<EtherfuseOnRampCard
							walletAddress={escrowContractAddress}
							escrowId={escrowContractAddress}
							onSuccess={onSuccess}
						/>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}
