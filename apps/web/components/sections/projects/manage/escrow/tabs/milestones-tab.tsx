'use client'

import type {
	EscrowType,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { CheckCircle2, FileText, Loader2, TrendingUp } from 'lucide-react'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import {
	getMilestoneStatus,
	isSingleReleaseMilestone,
} from '~/lib/utils/escrow/milestone-utils'

interface MilestonesTabProps {
	escrowContractAddress: string
	escrowType: EscrowType
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
	isLoading: boolean
	onSuccess: () => void
}

export function MilestonesTab({
	escrowContractAddress,
	escrowType,
	milestones,
	isLoading,
	onSuccess,
}: MilestonesTabProps) {
	const { approveMilestone, changeMilestoneStatus, sendTransaction } =
		useEscrow()
	const { isConnected, connect, address, signTransaction } = useWallet()
	const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState('0')
	const [milestoneStatus, setMilestoneStatus] = useState('approved')
	const [milestoneEvidence, setMilestoneEvidence] = useState('')
	const [isProcessing, setIsProcessing] = useState(false)

	const ensureWallet = async () => {
		if (!isConnected) await connect()
		if (!address) throw new Error('Wallet address missing')
		return address
	}

	const handleApproveMilestone = async () => {
		try {
			setIsProcessing(true)
			const signer = await ensureWallet()

			const approveResponse = await approveMilestone(
				{
					contractId: escrowContractAddress,
					milestoneIndex: selectedMilestoneIndex,
					approver: signer,
				},
				escrowType,
			)

			if (
				approveResponse.status !== 'SUCCESS' ||
				!approveResponse.unsignedTransaction
			) {
				throw new Error('Failed to prepare approval transaction')
			}

			const signedXdr = await signTransaction(
				approveResponse.unsignedTransaction,
			)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Milestone approved successfully!')
			onSuccess()
		} catch (error) {
			console.error(error)
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to approve milestone'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const handleChangeMilestoneStatus = async () => {
		try {
			setIsProcessing(true)
			const signer = await ensureWallet()

			const changeResponse = await changeMilestoneStatus(
				{
					contractId: escrowContractAddress,
					milestoneIndex: selectedMilestoneIndex,
					newStatus: milestoneStatus,
					newEvidence: milestoneEvidence || undefined,
					serviceProvider: signer,
				},
				escrowType,
			)

			if (
				changeResponse.status !== 'SUCCESS' ||
				!changeResponse.unsignedTransaction
			) {
				throw new Error('Failed to prepare status change transaction')
			}

			const signedXdr = await signTransaction(
				changeResponse.unsignedTransaction,
			)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Milestone status updated successfully!')
			setMilestoneEvidence('')
			onSuccess()
		} catch (error) {
			console.error(error)
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to update milestone status'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	if (isLoading) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="flex flex-col items-center justify-center space-y-4">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							Loading milestones...
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (milestones.length === 0) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="flex flex-col items-center justify-center space-y-4">
						<FileText className="h-8 w-8 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							No milestones found. Milestones are defined when creating the
							escrow.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Milestones</CardTitle>
					<CardDescription>
						View and manage all escrow milestones
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{milestones.map((milestone, index) => {
							const isApproved = getMilestoneStatus(milestone)
							const isSingle = isSingleReleaseMilestone(milestone)

							return (
								<div
									key={index}
									className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
								>
									<div className="flex-shrink-0">
										<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
											{index + 1}
										</div>
									</div>
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-2">
											<h4 className="font-semibold">Milestone {index + 1}</h4>
											{isApproved ? (
												<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
													Approved
												</span>
											) : (
												<span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
													Pending
												</span>
											)}
										</div>
										<p className="text-sm text-muted-foreground">
											{milestone.description}
										</p>
										{!isSingle && (
											<div className="flex items-center gap-4 text-sm">
												<span>
													Amount:{' '}
													<span className="font-semibold">
														$
														{(
															milestone as MultiReleaseMilestone
														).amount?.toLocaleString()}
													</span>
												</span>
												{milestone.evidence && (
													<span className="text-muted-foreground flex items-center gap-1">
														<FileText className="w-3 h-3" />
														Evidence provided
													</span>
												)}
											</div>
										)}
										{milestone.status && (
											<span className="text-xs text-muted-foreground">
												Status: {milestone.status}
											</span>
										)}
									</div>
								</div>
							)
						})}
					</div>
				</CardContent>
			</Card>

			{/* Milestone Actions */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle2 className="w-5 h-5" />
							Approve Milestone
						</CardTitle>
						<CardDescription>
							Approve a milestone as completed (Approver role required)
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="approve-milestone-select">Select Milestone</Label>
							<Select
								value={selectedMilestoneIndex}
								onValueChange={setSelectedMilestoneIndex}
								disabled={isProcessing}
							>
								<SelectTrigger id="approve-milestone-select">
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
						<Button
							onClick={handleApproveMilestone}
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
									<CheckCircle2 className="w-4 h-4 mr-2" />
									Approve Milestone
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="w-5 h-5" />
							Update Status
						</CardTitle>
						<CardDescription>
							Update milestone status and add evidence (Service Provider role
							required)
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="status-milestone-select">
									Select Milestone
								</Label>
								<Select
									value={selectedMilestoneIndex}
									onValueChange={setSelectedMilestoneIndex}
									disabled={isProcessing}
								>
									<SelectTrigger id="status-milestone-select">
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
							<div className="space-y-2">
								<Label htmlFor="milestone-status">Status</Label>
								<Select
									value={milestoneStatus}
									onValueChange={setMilestoneStatus}
									disabled={isProcessing}
								>
									<SelectTrigger id="milestone-status">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="approved">Approved</SelectItem>
										<SelectItem value="in_progress">In Progress</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="milestone-evidence">Evidence (Optional)</Label>
								<Input
									id="milestone-evidence"
									value={milestoneEvidence}
									onChange={(e) => setMilestoneEvidence(e.target.value)}
									placeholder="Add evidence or notes"
									disabled={isProcessing}
								/>
							</div>
						</div>
						<Button
							onClick={handleChangeMilestoneStatus}
							variant="outline"
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
									<TrendingUp className="w-4 h-4 mr-2" />
									Update Status
								</>
							)}
						</Button>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
