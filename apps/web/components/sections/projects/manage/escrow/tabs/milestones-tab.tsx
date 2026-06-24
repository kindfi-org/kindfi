'use client'

import type {
	EscrowType,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { ArrowRight, CheckCircle2, FileText, Loader2, Send, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { Alert, AlertDescription } from '~/components/base/alert'
import { Badge } from '~/components/base/badge'
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
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { cn } from '~/lib/utils'
import {
	getMilestoneStatus,
	isSingleReleaseMilestone,
	truncateAddress,
} from '~/lib/utils/escrow/milestone-utils'

interface MilestonesTabProps {
	escrowContractAddress: string
	escrowType: EscrowType
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
	isLoading: boolean
	onSuccess: () => void
	onGoToRelease?: () => void
}

export function MilestonesTab({
	escrowContractAddress,
	escrowType,
	milestones,
	isLoading,
	onSuccess,
	onGoToRelease,
}: MilestonesTabProps) {
	const { approveMilestone, changeMilestoneStatus, sendTransaction } = useEscrow()
	const { ensureTrustlessSigner, signTrustlessTransaction } = useTrustlessSigner()
	const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState('0')
	const [milestoneStatus, setMilestoneStatus] = useState('in_progress')
	const [milestoneEvidence, setMilestoneEvidence] = useState('')
	const [isProcessing, setIsProcessing] = useState(false)

	const selectedIndex = Number(selectedMilestoneIndex)
	const selectedMilestone = milestones[selectedIndex]

	const handleApproveMilestone = async () => {
		try {
			setIsProcessing(true)
			const signer = await ensureTrustlessSigner()

			const approveResponse = await approveMilestone(
				{
					contractId: escrowContractAddress,
					milestoneIndex: selectedMilestoneIndex,
					approver: signer,
				},
				escrowType,
			)

			if (approveResponse.status !== 'SUCCESS' || !approveResponse.unsignedTransaction) {
				throw new Error('Failed to prepare approval transaction')
			}

			const signedXdr = await signTrustlessTransaction(approveResponse.unsignedTransaction)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Milestone approved successfully')
			onSuccess()
		} catch (error) {
			logger.error(error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to approve milestone'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const handleChangeMilestoneStatus = async () => {
		try {
			setIsProcessing(true)
			const signer = await ensureTrustlessSigner()

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

			if (changeResponse.status !== 'SUCCESS' || !changeResponse.unsignedTransaction) {
				throw new Error('Failed to prepare status change transaction')
			}

			const signedXdr = await signTrustlessTransaction(changeResponse.unsignedTransaction)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Milestone status updated successfully')
			setMilestoneEvidence('')
			onSuccess()
		} catch (error) {
			logger.error(error)
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update milestone status'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center gap-4 py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
					<p className="text-sm text-muted-foreground" aria-live="polite">
						Loading milestones…
					</p>
				</CardContent>
			</Card>
		)
	}

	if (milestones.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center gap-4 py-12">
					<FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
					<p className="text-sm text-muted-foreground">
						No milestones found. They are defined when the escrow is created.
					</p>
				</CardContent>
			</Card>
		)
	}

	const isSelectedApproved = selectedMilestone ? getMilestoneStatus(selectedMilestone) : false

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Select a Milestone</CardTitle>
					<CardDescription>
						Choose a milestone to update its status or approve it. Approver and Service Provider
						roles sign with their connected wallet.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{milestones.map((milestone, index) => {
						const isApproved = getMilestoneStatus(milestone)
						const isSingle = isSingleReleaseMilestone(milestone)
						const isSelected = selectedMilestoneIndex === String(index)
						const multiMilestone = milestone as MultiReleaseMilestone

						return (
							<button
								key={index}
								type="button"
								onClick={() => setSelectedMilestoneIndex(String(index))}
								className={cn(
									'w-full rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									isSelected
										? 'border-primary bg-primary/5 shadow-sm'
										: 'bg-card hover:border-primary/30 hover:bg-muted/30',
								)}
								aria-pressed={isSelected}
							>
								<div className="flex items-start gap-3">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
										{index + 1}
									</div>
									<div className="min-w-0 flex-1 space-y-2">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-semibold">Milestone {index + 1}</span>
											{isApproved ? (
												<Badge className="gap-1">
													<CheckCircle2 className="h-3 w-3" aria-hidden="true" />
													Approved
												</Badge>
											) : (
												<Badge variant="secondary">Pending approval</Badge>
											)}
											{!isSingle && multiMilestone.flags?.released ? (
												<Badge variant="outline" className="gap-1">
													<Send className="h-3 w-3" aria-hidden="true" />
													Released
												</Badge>
											) : null}
										</div>
										<p className="text-sm text-muted-foreground">{milestone.description}</p>
										{!isSingle ? (
											<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
												{typeof multiMilestone.amount === 'number' ? (
													<span className="tabular-nums">
														Amount: ${multiMilestone.amount.toLocaleString()}
													</span>
												) : null}
												{multiMilestone.receiver ? (
													<span className="font-mono">
														Receiver: {truncateAddress(multiMilestone.receiver, 6)}
													</span>
												) : null}
											</div>
										) : null}
									</div>
								</div>
							</button>
						)
					})}
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<TrendingUp className="h-5 w-5" aria-hidden="true" />
							Update Progress
						</CardTitle>
						<CardDescription>
							Service Provider role: mark work in progress and attach evidence.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
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
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="approved">Approved</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="milestone-evidence">Evidence or Notes</Label>
							<Input
								id="milestone-evidence"
								name="milestone-evidence"
								autoComplete="off"
								value={milestoneEvidence}
								onChange={(e) => setMilestoneEvidence(e.target.value)}
								placeholder="Link, summary, or delivery note…"
								disabled={isProcessing}
							/>
						</div>
						<Button
							type="button"
							variant="outline"
							onClick={handleChangeMilestoneStatus}
							disabled={isProcessing}
							className="w-full"
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
									Updating…
								</>
							) : (
								<>
									<TrendingUp className="mr-2 h-4 w-4" aria-hidden="true" />
									Update Milestone {selectedIndex + 1}
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<CheckCircle2 className="h-5 w-5" aria-hidden="true" />
							Approve Milestone
						</CardTitle>
						<CardDescription>
							Approver role: confirm deliverables are complete before funds can release.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isSelectedApproved ? (
							<Alert>
								<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
								<AlertDescription>
									Milestone {selectedIndex + 1} is already approved. Go to Release to send funds.
								</AlertDescription>
							</Alert>
						) : (
							<p className="text-sm text-muted-foreground">
								Approving milestone {selectedIndex + 1} allows the Release Signer to disburse
								{escrowType === 'multi-release'
									? ' this milestone’s amount'
									: ' the escrow balance'}
								.
							</p>
						)}

						<Button
							type="button"
							onClick={handleApproveMilestone}
							disabled={isProcessing || isSelectedApproved}
							className="w-full"
							size="lg"
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
									Approving…
								</>
							) : (
								<>
									<CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
									Approve Milestone {selectedIndex + 1}
								</>
							)}
						</Button>

						{isSelectedApproved && onGoToRelease ? (
							<Button type="button" variant="secondary" onClick={onGoToRelease} className="w-full">
								Go to Release
								<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
							</Button>
						) : null}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
