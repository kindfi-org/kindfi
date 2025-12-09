'use client'

import type {
	EscrowType,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { AlertCircle, Loader2, Send } from 'lucide-react'
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
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'

interface ReleaseTabProps {
	escrowContractAddress: string
	escrowType: EscrowType
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
	onSuccess: () => void
}

export function ReleaseTab({
	escrowContractAddress,
	escrowType,
	milestones,
	onSuccess,
}: ReleaseTabProps) {
	const { releaseFunds, sendTransaction } = useEscrow()
	const { isConnected, connect, address, signTransaction } = useWallet()
	const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState('0')
	const [isProcessing, setIsProcessing] = useState(false)

	const isSingleRelease = escrowType === 'single-release'

	const ensureWallet = async () => {
		if (!isConnected) await connect()
		if (!address) throw new Error('Wallet address missing')
		return address
	}

	const handleReleaseFunds = async () => {
		try {
			setIsProcessing(true)
			const signer = await ensureWallet()

			const releaseResponse = await releaseFunds(
				isSingleRelease
					? {
							contractId: escrowContractAddress,
							releaseSigner: signer,
						}
					: {
							contractId: escrowContractAddress,
							releaseSigner: signer,
							milestoneIndex: selectedMilestoneIndex,
						},
				escrowType,
			)

			if (
				releaseResponse.status !== 'SUCCESS' ||
				!releaseResponse.unsignedTransaction
			) {
				throw new Error('Failed to prepare release transaction')
			}

			const signedXdr = await signTransaction(
				releaseResponse.unsignedTransaction,
			)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Funds released successfully!')
			onSuccess()
		} catch (error) {
			console.error(error)
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to release funds'
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
						<Send className="w-5 h-5 text-primary" />
					</div>
					<div>
						<CardTitle>Release Funds</CardTitle>
						<CardDescription>
							{isSingleRelease
								? 'Release all funds from the escrow contract'
								: 'Release funds for a specific milestone'}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{!isSingleRelease && (
					<div className="space-y-2">
						<Label htmlFor="release-milestone">Select Milestone</Label>
						<Select
							value={selectedMilestoneIndex}
							onValueChange={setSelectedMilestoneIndex}
							disabled={isProcessing}
						>
							<SelectTrigger id="release-milestone">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{milestones.map((_, index) => (
									<SelectItem key={index} value={String(index)}>
										Milestone {index + 1}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
					<div className="flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
						<div className="space-y-1">
							<p className="font-medium text-amber-900 dark:text-amber-100">
								Important
							</p>
							<p className="text-sm text-amber-800 dark:text-amber-200">
								{isSingleRelease
									? 'This will release all funds from the escrow. Make sure all milestones are approved before proceeding.'
									: 'This will release funds for the selected milestone. The milestone must be approved first.'}
							</p>
						</div>
					</div>
				</div>

				<Button
					onClick={handleReleaseFunds}
					disabled={isProcessing}
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
							Release Funds
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	)
}
