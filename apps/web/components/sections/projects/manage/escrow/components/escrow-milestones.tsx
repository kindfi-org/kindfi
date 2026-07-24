'use client'

import { AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '~/components/base/alert'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { useEscrowForm } from '../context/escrow-form-context'

export function EscrowMilestones() {
	const { formData, addMilestone, removeMilestone, updateMilestone } = useEscrowForm()
	const { milestones, selectedEscrowType } = formData
	const isMulti = selectedEscrowType === 'multi-release'

	const milestoneTotal = milestones.reduce((sum, milestone) => {
		if ('amount' in milestone && typeof milestone.amount === 'number') {
			return sum + milestone.amount
		}
		return sum
	}, 0)

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-sm font-medium">
						Releases <span className="text-destructive">*</span>
					</h3>
					<p className="mt-1 text-xs text-muted-foreground">
						{isMulti
							? 'Each release needs a description, amount, and receiver address.'
							: 'Describe each deliverable. Funds release together once all are approved.'}
					</p>
				</div>
				<Button
					type="button"
					onClick={addMilestone}
					variant="outline"
					size="sm"
					className="shrink-0"
				>
					<Plus className="mr-2 h-4 w-4" aria-hidden="true" />
					Add Release
				</Button>
			</div>

			{isMulti && milestoneTotal > 0 ? (
				<p className="text-sm text-muted-foreground">
					Combined release total:{' '}
					<span className="font-semibold tabular-nums text-foreground">{milestoneTotal}</span>
				</p>
			) : null}

			<div className="space-y-3">
				{milestones.length === 0 ? (
					<div className="rounded-lg border border-dashed p-6 text-center">
						<p className="text-sm text-muted-foreground">
							No releases yet. Add at least one to continue.
						</p>
					</div>
				) : null}

				{milestones.map((milestone, index) =>
					isMulti && 'amount' in milestone && 'receiver' in milestone ? (
						<div key={milestone.id} className="space-y-3 rounded-xl border bg-card p-4">
							<div className="flex items-center justify-between gap-3">
								<span className="text-sm font-semibold">Release {index + 1}</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => removeMilestone(milestone.id)}
									className="h-8 w-8 p-0"
									disabled={milestones.length <= 1}
									aria-label={`Remove release ${index + 1}`}
								>
									<Trash2 className="h-4 w-4" aria-hidden="true" />
								</Button>
							</div>
							<div className="grid gap-3 sm:grid-cols-3">
								<div className="sm:col-span-3">
									<Label
										htmlFor={`milestone-desc-${milestone.id}`}
										className="text-xs text-muted-foreground"
									>
										Description
									</Label>
									<Input
										id={`milestone-desc-${milestone.id}`}
										name={`milestone-desc-${index}`}
										autoComplete="off"
										value={milestone.description}
										onChange={(e) => updateMilestone(index, { description: e.target.value })}
										placeholder="Deliverable or phase description…"
									/>
								</div>
								<div>
									<Label
										htmlFor={`milestone-amount-${milestone.id}`}
										className="text-xs text-muted-foreground"
									>
										Amount <span className="text-destructive">*</span>
									</Label>
									<Input
										id={`milestone-amount-${milestone.id}`}
										name={`milestone-amount-${index}`}
										type="number"
										inputMode="decimal"
										autoComplete="off"
										value={milestone.amount}
										onChange={(e) =>
											updateMilestone(index, {
												amount: e.target.value === '' ? '' : Number(e.target.value),
											})
										}
										placeholder="0.00…"
										min="0"
										step="0.01"
									/>
								</div>
								<div className="sm:col-span-2">
									<Label
										htmlFor={`milestone-receiver-${milestone.id}`}
										className="text-xs text-muted-foreground"
									>
										Receiver Address <span className="text-destructive">*</span>
									</Label>
									<Input
										id={`milestone-receiver-${milestone.id}`}
										name={`milestone-receiver-${index}`}
										autoComplete="off"
										spellCheck={false}
										value={milestone.receiver}
										onChange={(e) => updateMilestone(index, { receiver: e.target.value })}
										placeholder="G… receiver with USDC trustline…"
										className="font-mono text-xs"
									/>
								</div>
							</div>
						</div>
					) : (
						<div key={milestone.id} className="flex items-start gap-2">
							<div className="grid flex-1 gap-1">
								<Label
									htmlFor={`milestone-desc-${milestone.id}`}
									className="text-xs text-muted-foreground"
								>
									Release {index + 1}
								</Label>
								<Input
									id={`milestone-desc-${milestone.id}`}
									name={`milestone-desc-${index}`}
									autoComplete="off"
									value={milestone.description}
									onChange={(e) => updateMilestone(index, { description: e.target.value })}
									placeholder="Deliverable or phase description…"
								/>
							</div>
							<Button
								type="button"
								variant="ghost"
								onClick={() => removeMilestone(milestone.id)}
								className="mt-6 h-8 w-8 p-0"
								disabled={milestones.length <= 1}
								aria-label={`Remove milestone ${index + 1}`}
							>
								<Trash2 className="h-4 w-4" aria-hidden="true" />
							</Button>
						</div>
					),
				)}
			</div>

			{isMulti ? (
				<Alert>
					<AlertTriangle className="h-4 w-4" aria-hidden="true" />
					<AlertDescription>
						Each receiver must have a USDC trustline on Stellar before funds can be released to
						them.
					</AlertDescription>
				</Alert>
			) : null}
		</div>
	)
}
