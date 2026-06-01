'use client'

import type {
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { FileText } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	getMilestoneStatus,
	isSingleReleaseMilestone,
} from '~/lib/utils/escrow/milestone-utils'

type MilestonesListProps = {
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
}

export function MilestonesList({ milestones }: MilestonesListProps) {
	return (
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
	)
}
