'use client'

import { ArrowRight, CheckCircle2, Circle, CircleDot } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { cn } from '~/lib/utils'
import type { EscrowManagementTab, EscrowWorkflowStep } from '../hooks/use-escrow-workflow-status'

interface EscrowWorkflowGuideProps {
	headline: string
	detail: string
	recommendedTab: EscrowManagementTab
	steps: EscrowWorkflowStep[]
	onGoToTab: (tab: EscrowManagementTab) => void
}

const STEP_ICONS = {
	complete: CheckCircle2,
	current: CircleDot,
	upcoming: Circle,
} as const

export function EscrowWorkflowGuide({
	headline,
	detail,
	recommendedTab,
	steps,
	onGoToTab,
}: EscrowWorkflowGuideProps) {
	return (
		<Card className="border-primary/20 bg-primary/5">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg text-wrap-balance">Next Step</CardTitle>
				<CardDescription>{detail}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="font-semibold">{headline}</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Work through Fund → Releases → Release in order.
						</p>
					</div>
					<Button type="button" onClick={() => onGoToTab(recommendedTab)} className="shrink-0">
						Go to{' '}
						{recommendedTab === 'overview'
							? 'Overview'
							: recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1)}
						<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
					</Button>
				</div>

				<ol className="grid gap-2 sm:grid-cols-3">
					{steps.map((step) => {
						const Icon = STEP_ICONS[step.status]
						return (
							<li
								key={step.id}
								className={cn(
									'rounded-lg border bg-background/80 p-3',
									step.status === 'current' && 'border-primary/40 ring-1 ring-primary/20',
								)}
							>
								<div className="flex items-start gap-2">
									<Icon
										className={cn(
											'mt-0.5 h-4 w-4 shrink-0',
											step.status === 'complete' && 'text-emerald-600',
											step.status === 'current' && 'text-primary',
											step.status === 'upcoming' && 'text-muted-foreground',
										)}
										aria-hidden="true"
									/>
									<div className="min-w-0">
										<p className="text-sm font-medium">{step.label}</p>
										<p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
									</div>
								</div>
							</li>
						)
					})}
				</ol>
			</CardContent>
		</Card>
	)
}
