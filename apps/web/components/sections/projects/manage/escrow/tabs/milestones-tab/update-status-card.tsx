'use client'

import type {
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { Loader2, TrendingUp } from 'lucide-react'
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

type UpdateStatusCardProps = {
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
	selectedMilestoneIndex: string
	onMilestoneChange: (value: string) => void
	milestoneStatus: string
	onStatusChange: (value: string) => void
	milestoneEvidence: string
	onEvidenceChange: (value: string) => void
	isProcessing: boolean
	onUpdateStatus: () => void
}

export function UpdateStatusCard({
	milestones,
	selectedMilestoneIndex,
	onMilestoneChange,
	milestoneStatus,
	onStatusChange,
	milestoneEvidence,
	onEvidenceChange,
	isProcessing,
	onUpdateStatus,
}: UpdateStatusCardProps) {
	return (
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
						<Label htmlFor="status-milestone-select">Select Milestone</Label>
						<Select
							value={selectedMilestoneIndex}
							onValueChange={onMilestoneChange}
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
							onValueChange={onStatusChange}
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
							onChange={(e) => onEvidenceChange(e.target.value)}
							placeholder="Add evidence or notes"
							disabled={isProcessing}
						/>
					</div>
				</div>
				<Button
					onClick={onUpdateStatus}
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
	)
}
