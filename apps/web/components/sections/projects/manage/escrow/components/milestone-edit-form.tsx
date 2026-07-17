'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { ArrowRight, CheckCircle2, Loader2, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '~/components/base/alert'
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

interface MilestoneEditFormProps {
	selectedIndex: number
	isSelectedApproved: boolean
	selectedPhase: string | null
	escrowType: EscrowType
	milestoneStatus: string
	milestoneEvidence: string
	isProcessing: boolean
	onMilestoneStatusChange: (value: string) => void
	onMilestoneEvidenceChange: (value: string) => void
	onChangeMilestoneStatus: () => void
	onApproveMilestone: () => void
	onGoToRelease?: () => void
}

export const MilestoneEditForm = ({
	selectedIndex,
	isSelectedApproved,
	selectedPhase,
	escrowType,
	milestoneStatus,
	milestoneEvidence,
	isProcessing,
	onMilestoneStatusChange,
	onMilestoneEvidenceChange,
	onChangeMilestoneStatus,
	onApproveMilestone,
	onGoToRelease,
}: MilestoneEditFormProps) => {
	return (
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
							onValueChange={onMilestoneStatusChange}
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
							onChange={(e) => onMilestoneEvidenceChange(e.target.value)}
							placeholder="Link, summary, or delivery note…"
							disabled={isProcessing}
						/>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={onChangeMilestoneStatus}
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
							{escrowType === 'multi-release' ? " this release's amount" : ' the escrow balance'}.
						</p>
					)}

					<Button
						type="button"
						onClick={onApproveMilestone}
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
	)
}
