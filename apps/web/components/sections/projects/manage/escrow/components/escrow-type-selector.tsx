'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { Layers, Wallet } from 'lucide-react'
import { useId } from 'react'
import { cn } from '~/lib/utils'
import { useEscrowForm } from '../context/escrow-form-context'

const ESCROW_TYPE_OPTIONS: {
	value: EscrowType
	title: string
	description: string
	bestFor: string
	icon: typeof Wallet
}[] = [
	{
		value: 'single-release',
		title: 'Single Release',
		description:
			'One total amount is held in escrow and released when all milestones are approved.',
		bestFor: 'Best for fixed-scope projects with one final payout.',
		icon: Wallet,
	},
	{
		value: 'multi-release',
		title: 'Multi Release',
		description:
			'Each milestone has its own amount and receiver. Funds release per milestone as they are approved.',
		bestFor: 'Best for phased work with separate payouts per deliverable.',
		icon: Layers,
	},
]

export function EscrowTypeSelector() {
	const { formData, convertMilestones } = useEscrowForm()
	const groupLabelId = useId()

	return (
		<fieldset className="space-y-3" aria-labelledby={groupLabelId}>
			<legend id={groupLabelId} className="sr-only">
				Escrow type
			</legend>
			<div className="grid gap-4 sm:grid-cols-2">
				{ESCROW_TYPE_OPTIONS.map((option) => {
					const isSelected = formData.selectedEscrowType === option.value
					const Icon = option.icon

					return (
						<button
							key={option.value}
							type="button"
							onClick={() => convertMilestones(option.value)}
							className={cn(
								'flex h-full flex-col rounded-xl border-2 p-4 text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
								isSelected
									? 'border-primary bg-primary/5 shadow-sm'
									: 'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
							)}
							aria-pressed={isSelected}
						>
							<div className="flex items-start gap-3">
								<div
									className={cn(
										'rounded-lg p-2',
										isSelected
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground',
									)}
								>
									<Icon className="h-5 w-5" aria-hidden="true" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-semibold">{option.title}</p>
									<p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
									<p className="mt-2 text-xs font-medium text-primary">{option.bestFor}</p>
								</div>
							</div>
						</button>
					)
				})}
			</div>
		</fieldset>
	)
}
