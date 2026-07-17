'use client'

import type { MultiReleaseMilestone, SingleReleaseMilestone } from '@trustless-work/escrow'
import { CheckCircle2, Pencil } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/base/tooltip'
import { cn } from '~/lib/utils'
import {
	getMilestoneEditBlockReason,
	isMilestoneEditable,
} from '~/lib/utils/escrow/build-update-escrow-payload'
import {
	formatMilestoneReleasePhase,
	getMilestoneReleasePhase,
	getMilestoneReleasePhaseBadgeVariant,
	isSingleReleaseMilestone,
	truncateAddress,
} from '~/lib/utils/escrow/milestone-utils'

interface MilestoneListItemProps {
	milestone: SingleReleaseMilestone | MultiReleaseMilestone
	index: number
	isSelected: boolean
	isProcessing: boolean
	hasEscrowData: boolean
	onSelect: (index: number) => void
	onEdit: (index: number) => void
}

export const MilestoneListItem = ({
	milestone,
	index,
	isSelected,
	isProcessing,
	hasEscrowData,
	onSelect,
	onEdit,
}: MilestoneListItemProps) => {
	const phase = getMilestoneReleasePhase(milestone)
	const isSingle = isSingleReleaseMilestone(milestone)
	const multiMilestone = milestone as MultiReleaseMilestone
	const canEdit = isMilestoneEditable(milestone)
	const editBlockReason = getMilestoneEditBlockReason(milestone)

	return (
		<div
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
					onClick={() => onSelect(index)}
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
								<Badge variant={getMilestoneReleasePhaseBadgeVariant(phase)} className="gap-1">
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
								onClick={() => onEdit(index)}
								disabled={isProcessing || !hasEscrowData || !canEdit}
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
}
