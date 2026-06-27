'use client'

import type {
	EscrowType,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { getMilestoneStatus, isSingleReleaseMilestone } from '~/lib/utils/escrow/milestone-utils'
import { EtherfuseOffRampCard } from '../components/etherfuse-off-ramp-card'

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
	const { ensureTrustlessSigner, signTrustlessTransaction } = useTrustlessSigner()
	const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState('0')
	const [isProcessing, setIsProcessing] = useState(false)

	const isSingleRelease = escrowType === 'single-release'
	const selectedIndex = Number(selectedMilestoneIndex)
	const selectedMilestone = milestones[selectedIndex]

	const releaseReadiness = useMemo(() => {
		if (isSingleRelease) {
			const allApproved = milestones.length > 0 && milestones.every((m) => getMilestoneStatus(m))
			return {
				canRelease: allApproved,
				message: allApproved
					? 'All milestones are approved. You can release the full escrow balance.'
					: 'Approve all milestones before releasing funds.',
			}
		}

		if (!selectedMilestone) {
			return { canRelease: false, message: 'Select a milestone to release.' }
		}

		const isApproved = getMilestoneStatus(selectedMilestone)
		const isReleased =
			!isSingleReleaseMilestone(selectedMilestone) && selectedMilestone.flags?.released

		if (isReleased) {
			return { canRelease: false, message: 'This milestone has already been released.' }
		}

		return {
			canRelease: isApproved,
			message: isApproved
				? 'This milestone is approved and ready for release.'
				: 'Approve this milestone before releasing its funds.',
		}
	}, [isSingleRelease, milestones, selectedMilestone])

	const handleReleaseFunds = async () => {
		try {
			setIsProcessing(true)
			const signer = await ensureTrustlessSigner()

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

			if (releaseResponse.status !== 'SUCCESS' || !releaseResponse.unsignedTransaction) {
				throw new Error('Failed to prepare release transaction')
			}

			const signedXdr = await signTrustlessTransaction(releaseResponse.unsignedTransaction)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Funds released successfully')
			onSuccess()
		} catch (error) {
			logger.error(error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to release funds'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2">
						<Send className="h-5 w-5 text-primary" aria-hidden="true" />
					</div>
					<div>
						<CardTitle>Release Funds</CardTitle>
						<CardDescription>
							Release Signer role: disburse approved funds to receivers on-chain.
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="crypto" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="crypto">Crypto Release</TabsTrigger>
						<TabsTrigger value="fiat">Fiat Off-Ramp</TabsTrigger>
					</TabsList>
					<TabsContent value="crypto" className="mt-6 space-y-6">
						{!isSingleRelease ? (
							<div className="space-y-2">
								<Label htmlFor="release-milestone">Milestone to Release</Label>
								<Select
									value={selectedMilestoneIndex}
									onValueChange={setSelectedMilestoneIndex}
									disabled={isProcessing}
								>
									<SelectTrigger id="release-milestone">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{milestones.map((milestone, index) => {
											const approved = getMilestoneStatus(milestone)
											const released =
												!isSingleReleaseMilestone(milestone) && milestone.flags?.released
											return (
												<SelectItem key={index} value={String(index)}>
													Milestone {index + 1}
													{approved ? ' · Approved' : ''}
													{released ? ' · Released' : ''}
												</SelectItem>
											)
										})}
									</SelectContent>
								</Select>
							</div>
						) : null}

						<Alert
							variant={releaseReadiness.canRelease ? 'default' : 'destructive'}
							className={
								releaseReadiness.canRelease
									? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/20'
									: undefined
							}
						>
							{releaseReadiness.canRelease ? (
								<CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
							) : (
								<AlertCircle className="h-4 w-4" aria-hidden="true" />
							)}
							<AlertTitle>
								{releaseReadiness.canRelease ? 'Ready to release' : 'Not ready yet'}
							</AlertTitle>
							<AlertDescription>{releaseReadiness.message}</AlertDescription>
						</Alert>

						{!isSingleRelease && selectedMilestone ? (
							<div className="flex flex-wrap gap-2">
								{getMilestoneStatus(selectedMilestone) ? (
									<Badge className="gap-1">
										<CheckCircle2 className="h-3 w-3" aria-hidden="true" />
										Approved
									</Badge>
								) : (
									<Badge variant="secondary">Not approved</Badge>
								)}
								{!isSingleReleaseMilestone(selectedMilestone) &&
								selectedMilestone.flags?.released ? (
									<Badge variant="outline">Already released</Badge>
								) : null}
							</div>
						) : null}

						<Button
							type="button"
							onClick={handleReleaseFunds}
							disabled={isProcessing || !releaseReadiness.canRelease}
							className="w-full"
							size="lg"
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
									Releasing…
								</>
							) : (
								<>
									<Send className="mr-2 h-4 w-4" aria-hidden="true" />
									{isSingleRelease ? 'Release All Funds' : `Release Milestone ${selectedIndex + 1}`}
								</>
							)}
						</Button>
					</TabsContent>
					<TabsContent value="fiat" className="mt-6">
						<EtherfuseOffRampCard
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
