'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { DollarSign, Info, Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'

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
	const { isConnected, connect, address, signTransaction } = useWallet()
	const [fundAmount, setFundAmount] = useState<number | ''>('')
	const [isProcessing, setIsProcessing] = useState(false)

	const ensureWallet = async () => {
		if (!isConnected) await connect()
		if (!address) throw new Error('Wallet address missing')
		return address
	}

	const handleFundEscrow = async () => {
		if (!fundAmount || Number(fundAmount) <= 0) {
			toast.error('Please enter a valid amount')
			return
		}

		try {
			setIsProcessing(true)
			const signer = await ensureWallet()

			// 1) Get unsigned transaction
			const fundResponse = await fundEscrow(
				{
					amount: Number(fundAmount),
					contractId: escrowContractAddress,
					signer,
				},
				escrowType,
			)

			if (
				fundResponse.status !== 'SUCCESS' ||
				!fundResponse.unsignedTransaction
			) {
				throw new Error('Failed to prepare funding transaction')
			}

			// 2) Sign transaction
			const signedXdr = await signTransaction(fundResponse.unsignedTransaction)

			// 3) Send transaction
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Escrow funded successfully!', {
				description: `You've added $${Number(fundAmount).toLocaleString()} to the escrow.`,
			})

			setFundAmount('')
			onSuccess()
		} catch (error) {
			console.error(error)
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to fund escrow'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-primary/10">
						<DollarSign className="w-5 h-5 text-primary" />
					</div>
					<div>
						<CardTitle>Fund Escrow</CardTitle>
						<CardDescription>
							Add funds to your escrow contract. You'll need to approve the
							transaction in your wallet.
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="fund-amount" className="text-base font-medium">
						Amount (USDC)
					</Label>
					<Input
						id="fund-amount"
						type="number"
						value={fundAmount}
						onChange={(e) =>
							setFundAmount(e.target.value === '' ? '' : Number(e.target.value))
						}
						placeholder="0.00"
						min="0"
						step="0.01"
						className="text-lg"
						disabled={isProcessing}
					/>
					<p className="text-xs text-muted-foreground">
						Enter the amount you want to add to the escrow
					</p>
				</div>

				<div className="rounded-lg border p-4 bg-muted/50">
					<div className="flex items-start gap-3">
						<Info className="w-5 h-5 text-primary mt-0.5" />
						<div className="space-y-1">
							<p className="text-sm font-medium">Current Balance</p>
							<p className="text-2xl font-bold">
								{isLoadingBalance ? (
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
					</div>
				</div>

				<Button
					onClick={handleFundEscrow}
					disabled={!fundAmount || Number(fundAmount) <= 0 || isProcessing}
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
							<Send className="w-4 h-4 mr-2" />
							Fund Escrow
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	)
}
