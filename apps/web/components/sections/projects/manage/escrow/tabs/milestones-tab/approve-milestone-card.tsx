'use client'

import type {
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { CheckCircle2, Loader2 } from 'lucide-react'
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

type ApproveMilestoneCardProps = {
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
	selectedMilestoneIndex: string
	onMilestoneChange: (value: string) => void
	isProcessing: boolean
	onApprove: () => void
}

export function ApproveMilestoneCard({
	milestones,
	selectedMilestoneIndex,
	onMilestoneChange,
	isProcessing,
	onApprove,
}: ApproveMilestoneCardProps) {
	return (
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
						onValueChange={onMilestoneChange}
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
					onClick={onApprove}
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
	)
}
