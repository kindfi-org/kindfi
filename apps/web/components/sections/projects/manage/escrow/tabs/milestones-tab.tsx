'use client'

import type {
	EscrowType,
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { ArrowRight, CheckCircle2, FileText, Loader2, Pencil, Plus, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/base/tooltip'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { cn } from '~/lib/utils'
import {
	buildEditReleasePayload,
	buildUpdateEscrowPayload,
	getMilestoneEditBlockReason,
	isMilestoneEditable,
	MAX_ESCROW_RELEASES,
	type NewRelease,
} from '~/lib/utils/escrow/build-update-escrow-payload'
import {
	formatMilestoneReleasePhase,
	getMilestoneReleasePhase,
	getMilestoneReleasePhaseBadgeVariant,
	getMilestoneStatus,
	getMilestoneWorkStatus,
	isSingleReleaseMilestone,
	normalizeWorkStatusForForm,
	truncateAddress,
} from '~/lib/utils/escrow/milestone-utils'
import { AddReleaseDialog, type ReleaseFormValues } from '../components/add-release-dialog'

interface MilestonesTabProps {
	escrowContractAddress: string
	escrowType: EscrowType
	escrowData: GetEscrowsFromIndexerResponse | null
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
	isLoading: boolean
	onSuccess: () => void
	onPatchMilestone?: (
		index: number,
		patch: { kind: 'approve' } | { kind: 'status'; status: string; evidence?: string },
	) => void
	onGoToRelease?: () => void
}

export function MilestonesTab({
	escrowContractAddress,
	escrowType,
	escrowData,
	milestones,
	isLoading,
	onSuccess,
	onPatchMilestone,
	onGoToRelease,
}: MilestonesTabProps) {
	const { approveMilestone, changeMilestoneStatus, sendTransaction, updateEscrow } = useEscrow()
	const { ensureTrustlessSigner, signTrustlessTransaction } = useTrustlessSigner()
	const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState('0')
	const [milestoneStatus, setMilestoneStatus] = useState('in_progress')
	const [milestoneEvidence, setMilestoneEvidence] = useState('')
	const [isProcessing, setIsProcessing] = useState(false)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<number | null>(null)

	const selectedIndex = Number(selectedMilestoneIndex)
	const selectedMilestone = milestones[selectedIndex]
	const selectedPhase = selectedMilestone ? getMilestoneReleasePhase(selectedMilestone) : null
	const canAddRelease = milestones.length < MAX_ESCROW_RELEASES && !escrowData?.flags?.disputed
	const editingMilestone = editingMilestoneIndex !== null ? milestones[editingMilestoneIndex] : null

	useEffect(() => {
		const milestone = milestones[selectedIndex]
		if (!milestone) return

		setMilestoneStatus(normalizeWorkStatusForForm(getMilestoneWorkStatus(milestone)))
		setMilestoneEvidence(milestone.evidence ?? '')
	}, [milestones, selectedIndex])

	const submitEscrowUpdate = async (
		payload: ReturnType<typeof buildUpdateEscrowPayload>,
		successMessage: string,
		onComplete?: () => void,
	) => {
		const updateResponse = await updateEscrow(payload, escrowType)
		if (updateResponse.status !== 'SUCCESS' || !updateResponse.unsignedTransaction) {
			throw new Error('Failed to prepare escrow update transaction')
		}

		const signedXdr = await signTrustlessTransaction(updateResponse.unsignedTransaction)
		const sendResult = await sendTransaction(signedXdr)
		if (sendResult?.status !== 'SUCCESS') {
			throw new Error('Transaction failed')
		}

		toast.success(successMessage)
		onComplete?.()
		onSuccess()
	}

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

			toast.success('Release approved successfully')
			onPatchMilestone?.(selectedIndex, { kind: 'approve' })
			onSuccess()
		} catch (error) {
			logger.error(error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to approve release'
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

			toast.success('Release status updated successfully')
			const evidence = milestoneEvidence || undefined
			setMilestoneEvidence('')
			onPatchMilestone?.(selectedIndex, {
				kind: 'status',
				status: milestoneStatus,
				evidence,
			})
			onSuccess()
		} catch (error) {
			logger.error(error)
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update release status'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const handleAddRelease = async (newRelease: NewRelease) => {
		if (!escrowData) {
			toast.error('Escrow data is not loaded yet. Try refreshing.')
			return
		}

		try {
			setIsProcessing(true)
			const signer = await ensureTrustlessSigner()
			const payload = buildUpdateEscrowPayload(escrowData, escrowType, signer, newRelease)
			await submitEscrowUpdate(payload, 'Release added successfully', () =>
				setIsAddDialogOpen(false),
			)
		} catch (error) {
			logger.error(error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to add release'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const handleEditRelease = async (editedRelease: ReleaseFormValues) => {
		if (!escrowData || editingMilestoneIndex === null) {
			toast.error('Escrow data is not loaded yet. Try refreshing.')
			return
		}

		try {
			setIsProcessing(true)
			const signer = await ensureTrustlessSigner()
			const payload = buildEditReleasePayload(
				escrowData,
				escrowType,
				signer,
				editingMilestoneIndex,
				editedRelease,
			)
			await submitEscrowUpdate(payload, 'Release updated successfully', () =>
				setEditingMilestoneIndex(null),
			)
		} catch (error) {
			logger.error(error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to update release'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const getReleaseFormValues = (
		milestone: SingleReleaseMilestone | MultiReleaseMilestone,
	): ReleaseFormValues => {
		if (isSingleReleaseMilestone(milestone)) {
			return { description: milestone.description }
		}

		return {
			description: milestone.description,
			amount: milestone.amount,
			receiver: milestone.receiver,
		}
	}

	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center gap-4 py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
					<p className="text-sm text-muted-foreground" aria-live="polite">
						Loading releases…
					</p>
				</CardContent>
			</Card>
		)
	}

	if (milestones.length === 0) {
		return (
			<div className="space-y-4">
				<Card>
					<CardContent className="flex flex-col items-center justify-center gap-4 py-12">
						<FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
						<p className="text-sm text-muted-foreground">
							No releases found yet. Add one to get started.
						</p>
						{escrowData ? (
							<Button
								type="button"
								onClick={() => setIsAddDialogOpen(true)}
								disabled={isProcessing || !canAddRelease}
							>
								<Plus className="mr-2 h-4 w-4" aria-hidden="true" />
								Add release
							</Button>
						) : null}
					</CardContent>
				</Card>
				<AddReleaseDialog
					open={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}
					escrowType={escrowType}
					isSubmitting={isProcessing}
					onSubmit={handleAddRelease}
				/>
			</div>
		)
	}

	const isSelectedApproved = selectedMilestone ? getMilestoneStatus(selectedMilestone) : false

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<CardTitle>Select a Release</CardTitle>
							<CardDescription>
								Choose a release to update its status or approve it. Approver and Service Provider
								roles sign with their connected wallet.
							</CardDescription>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setIsAddDialogOpen(true)}
							disabled={isProcessing || !canAddRelease || !escrowData}
							className="shrink-0"
						>
							<Plus className="mr-2 h-4 w-4" aria-hidden="true" />
							Add release
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					<TooltipProvider delayDuration={200}>
						{milestones.map((milestone, index) => {
							const phase = getMilestoneReleasePhase(milestone)
							const isSingle = isSingleReleaseMilestone(milestone)
							const isSelected = selectedMilestoneIndex === String(index)
							const multiMilestone = milestone as MultiReleaseMilestone
							const canEdit = isMilestoneEditable(milestone)
							const editBlockReason = getMilestoneEditBlockReason(milestone)

							return (
								<div
									key={index}
									className={cn(
										'w-full rounded-xl border p-4 transition-[border-color,background-color,box-shadow] duration-200',
										isSelected
											? 'border-primary bg-primary/5 shadow-sm'
											: 'bg-card hover:border-primary/30 hover:bg-muted/30',
									)}
								>
									<div className="flex items-start gap-3">
										<button
											type="button"
											onClick={() => setSelectedMilestoneIndex(String(index))}
											className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
											aria-pressed={isSelected}
										>
											<div className="flex items-start gap-3">
												<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
													{index + 1}
												</div>
												<div className="min-w-0 flex-1 space-y-2">
													<div className="flex flex-wrap items-center gap-2">
														<span className="font-semibold">Release {index + 1}</span>
														<Badge
															variant={getMilestoneReleasePhaseBadgeVariant(phase)}
															className="gap-1"
														>
															{phase === 'approved' || phase === 'released' ? (
																<CheckCircle2 className="h-3 w-3" aria-hidden="true" />
															) : null}
															{formatMilestoneReleasePhase(phase)}
														</Badge>
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
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="inline-flex shrink-0">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => setEditingMilestoneIndex(index)}
														disabled={isProcessing || !escrowData || !canEdit}
														aria-label={`Edit release ${index + 1}`}
													>
														<Pencil className="h-4 w-4" aria-hidden="true" />
													</Button>
												</span>
											</TooltipTrigger>
											{editBlockReason ? (
												<TooltipContent side="left" className="max-w-xs text-left">
													{editBlockReason}
												</TooltipContent>
											) : (
												<TooltipContent side="left">Edit release details</TooltipContent>
											)}
										</Tooltip>
									</div>
								</div>
							)
						})}
					</TooltipProvider>
				</CardContent>
			</Card>

			{!canAddRelease && milestones.length >= MAX_ESCROW_RELEASES ? (
				<Alert>
					<AlertDescription>
						This escrow has reached the maximum of {MAX_ESCROW_RELEASES} releases.
					</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<TrendingUp className="h-5 w-5" aria-hidden="true" />
							Update Progress
						</CardTitle>
						<CardDescription>
							Service Provider role: report work progress and attach evidence. This does not approve
							the release — use Approve Release with the approver wallet.
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
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
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
									Update Release {selectedIndex + 1}
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<CheckCircle2 className="h-5 w-5" aria-hidden="true" />
							Approve Release
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
									Release {selectedIndex + 1} is already approved. Go to Release to send funds.
								</AlertDescription>
							</Alert>
						) : selectedPhase === 'ready_for_approval' ? (
							<p className="text-sm text-muted-foreground">
								Work is marked complete for release {selectedIndex + 1}. Connect the approver wallet
								and sign below to authorize fund release.
							</p>
						) : (
							<p className="text-sm text-muted-foreground">
								Approving release {selectedIndex + 1} allows the Release Signer to disburse
								{escrowType === 'multi-release' ? ' this release’s amount' : ' the escrow balance'}.
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
									Approve Release {selectedIndex + 1}
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

			<AddReleaseDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				escrowType={escrowType}
				isSubmitting={isProcessing}
				onSubmit={handleAddRelease}
			/>

			{editingMilestone ? (
				<AddReleaseDialog
					open={editingMilestoneIndex !== null}
					onOpenChange={(open) => {
						if (!open) {
							setEditingMilestoneIndex(null)
						}
					}}
					escrowType={escrowType}
					isSubmitting={isProcessing}
					mode="edit"
					releaseLabel={`Release ${(editingMilestoneIndex ?? 0) + 1}`}
					initialValues={getReleaseFormValues(editingMilestone)}
					onSubmit={handleEditRelease}
				/>
			) : null}
		</div>
	)
}
