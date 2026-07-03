'use client'

import type { MultiReleaseMilestone, SingleReleaseMilestone } from '@trustless-work/escrow'
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { Progress } from '~/components/base/progress'
import {
	calculateMilestoneProgress,
	formatEscrowAmount,
	formatMilestoneReleasePhase,
	getMilestoneReleasePhase,
	getMilestoneReleasePhaseBadgeVariant,
	isSingleReleaseMilestone,
	truncateAddress,
} from '~/lib/utils/escrow/milestone-utils'

interface MilestonesOverviewCardProps {
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
}

export function MilestonesOverviewCard({ milestones }: MilestonesOverviewCardProps) {
	if (milestones.length === 0) return null

	const progress = calculateMilestoneProgress(milestones)

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Releases Overview</CardTitle>
						<CardDescription>Quick view of all releases and their status</CardDescription>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold">{progress}%</div>
						<p className="text-xs text-muted-foreground">Complete</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<Progress value={progress} className="h-3" />
				<div className="space-y-3">
					{milestones.map((milestone, index) => {
						const phase = getMilestoneReleasePhase(milestone)
						const isSingle = isSingleReleaseMilestone(milestone)
						const multiMilestone = milestone as MultiReleaseMilestone

						return (
							<div
								key={index}
								className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
							>
								<div className="flex-1 space-y-2">
									<div className="flex items-center gap-3 flex-wrap">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
											{index + 1}
										</div>
										<span className="font-semibold">Release {index + 1}</span>
										<Badge variant={getMilestoneReleasePhaseBadgeVariant(phase)} className="gap-1">
											{phase === 'approved' || phase === 'released' ? (
												<CheckCircle2 className="w-3 h-3" />
											) : null}
											{formatMilestoneReleasePhase(phase)}
										</Badge>
										{!isSingle && multiMilestone.flags?.disputed && (
											<Badge variant="destructive" className="gap-1">
												<AlertCircle className="w-3 h-3" />
												Disputed
											</Badge>
										)}
									</div>
									<p className="text-sm text-muted-foreground ml-11">{milestone.description}</p>
									{!isSingle && (
										<div className="ml-11 space-y-1">
											<div className="flex gap-4 text-sm flex-wrap">
												<span>
													Amount:{' '}
													<span className="font-semibold">
														{formatEscrowAmount(multiMilestone.amount ?? 0)}
													</span>
												</span>
												{multiMilestone.receiver && (
													<span className="text-muted-foreground">
														Receiver:{' '}
														<span className="font-mono text-xs">
															{truncateAddress(multiMilestone.receiver, 8)}
														</span>
													</span>
												)}
											</div>
											{milestone.status && (
												<Badge variant="outline" className="text-xs">
													Status: {milestone.status}
												</Badge>
											)}
											{milestone.evidence && (
												<div className="flex items-center gap-1 text-xs text-muted-foreground">
													<FileText className="w-3 h-3" />
													Evidence provided
												</div>
											)}
										</div>
									)}
									{isSingle && milestone.status && (
										<div className="ml-11">
											<Badge variant="outline" className="text-xs">
												Status: {milestone.status}
											</Badge>
										</div>
									)}
									{isSingle && milestone.evidence && (
										<div className="ml-11 flex items-center gap-1 text-xs text-muted-foreground">
											<FileText className="w-3 h-3" />
											Evidence provided
										</div>
									)}
								</div>
							</div>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}
