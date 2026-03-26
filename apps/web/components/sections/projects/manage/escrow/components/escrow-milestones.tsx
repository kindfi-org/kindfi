'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/base/tooltip'
import { useEscrowForm } from '../context/escrow-form-context'

export function EscrowMilestones() {
	const { formData, addMilestone, removeMilestone, updateMilestone } =
		useEscrowForm()
	const { milestones, selectedEscrowType } = formData

	return (
		<div className="space-y-2">
			<div className="flex justify-between items-center">
				<div className="flex gap-2 items-center">
					<h3 className="text-sm font-medium">
						Milestones <span className="text-destructive">*</span>
					</h3>
					<Tooltip>
						<TooltipTrigger className="text-xs underline">
							More information
						</TooltipTrigger>
						<TooltipContent>
							{selectedEscrowType === 'multi-release'
								? 'For multi-release escrows, each milestone must have an amount and receiver address.'
								: 'Provide one or more milestone descriptions.'}
						</TooltipContent>
					</Tooltip>
				</div>
				<Button onClick={addMilestone} variant="outline" className="px-2 h-8">
					<Plus className="w-4 h-4" /> Add Item
				</Button>
			</div>

			<div className="space-y-3">
				{milestones.map((m, i) =>
					selectedEscrowType === 'multi-release' &&
					'amount' in m &&
					'receiver' in m ? (
						<div
							key={m.id}
							className="p-4 rounded-lg border bg-card space-y-3"
						>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Milestone {i + 1}</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => removeMilestone(m.id)}
									className="h-8 w-8 p-0"
									aria-label={`Remove milestone ${i + 1}`}
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
							<div className="grid gap-3 sm:grid-cols-3">
								<div className="sm:col-span-3">
									<Label className="text-xs text-muted-foreground">
										Description
									</Label>
									<Input
										value={m.description}
										onChange={(e) =>
											updateMilestone(i, { description: e.target.value })
										}
										placeholder="Milestone description"
									/>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">
										Amount <span className="text-destructive">*</span>
									</Label>
									<Input
										type="number"
										value={m.amount}
										onChange={(e) =>
											updateMilestone(i, {
												amount: e.target.value === '' ? '' : Number(e.target.value),
											})
										}
										placeholder="0.00"
										min="0"
										step="0.01"
									/>
								</div>
								<div className="sm:col-span-2">
									<Label className="text-xs text-muted-foreground">
										Receiver Address{' '}
										<span className="text-destructive">*</span>
									</Label>
									<Input
										value={m.receiver}
										onChange={(e) =>
											updateMilestone(i, { receiver: e.target.value })
										}
										placeholder="Enter Stellar address (must have USDC trustline)"
									/>
									<p className="text-xs text-muted-foreground mt-1">
										⚠️ The receiver address must have a USDC trustline
										established.
									</p>
								</div>
							</div>
						</div>
					) : (
						<div key={m.id} className="flex gap-2 items-center">
							<Input
								value={m.description}
								onChange={(e) =>
									updateMilestone(i, { description: e.target.value })
								}
								placeholder="Milestone Description"
							/>
							<Button
								variant="ghost"
								onClick={() => removeMilestone(m.id)}
								className="p-0 w-8 h-8"
								aria-label={`Remove milestone ${i + 1}`}
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					),
				)}
			</div>
		</div>
	)
}
