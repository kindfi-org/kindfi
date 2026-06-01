'use client'

import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { Textarea } from '~/components/base/textarea'
import { EMPTY_ROW } from './constants'
import { ProjectPicker } from './project-picker'
import type { OptionRow, ProjectSummary } from './types'

interface CreateRoundFormProps {
	form: {
		title: string
		description: string
		startsAt: string
		endsAt: string
		totalFundAmount: string
		fundCurrency: string
	}
	onFormChange: (patch: Partial<CreateRoundFormProps['form']>) => void
	optionRows: OptionRow[]
	onOptionRowsChange: (rows: OptionRow[]) => void
	onProjectSelect: (index: number, project: ProjectSummary) => void
	projects: ProjectSummary[]
	loadingProjects: boolean
	isPending: boolean
	validOptionCount: number
}

export const CreateRoundForm = ({
	form,
	onFormChange,
	optionRows,
	onOptionRowsChange,
	onProjectSelect,
	projects,
	loadingProjects,
	isPending,
	validOptionCount,
}: CreateRoundFormProps) => {
	const updateRow = (i: number, patch: Partial<OptionRow>) => {
		onOptionRowsChange(
			optionRows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
		)
	}

	return (
		<div className="space-y-4 py-2">
			<div className="space-y-1.5">
				<Label htmlFor="gr-title">Title *</Label>
				<Input
					id="gr-title"
					placeholder="Round #1 – Q1 2026"
					value={form.title}
					onChange={(e) => onFormChange({ title: e.target.value })}
					disabled={isPending}
				/>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="gr-desc">Description</Label>
				<Textarea
					id="gr-desc"
					placeholder="Describe the purpose of this voting round…"
					value={form.description}
					onChange={(e) => onFormChange({ description: e.target.value })}
					rows={2}
					disabled={isPending}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<Label htmlFor="gr-starts">Starts At *</Label>
					<Input
						id="gr-starts"
						type="datetime-local"
						value={form.startsAt}
						onChange={(e) => onFormChange({ startsAt: e.target.value })}
						disabled={isPending}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="gr-ends">Ends At *</Label>
					<Input
						id="gr-ends"
						type="datetime-local"
						value={form.endsAt}
						onChange={(e) => onFormChange({ endsAt: e.target.value })}
						disabled={isPending}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<Label htmlFor="gr-amount">Fund Amount</Label>
					<Input
						id="gr-amount"
						type="number"
						placeholder="10000"
						value={form.totalFundAmount}
						onChange={(e) =>
							onFormChange({ totalFundAmount: e.target.value })
						}
						disabled={isPending}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="gr-currency">Currency</Label>
					<Input
						id="gr-currency"
						placeholder="XLM"
						value={form.fundCurrency}
						onChange={(e) => onFormChange({ fundCurrency: e.target.value })}
						disabled={isPending}
					/>
				</div>
			</div>

			<div>
				<div className="flex items-center justify-between mb-2">
					<p className="text-sm font-semibold">Redistribution Options</p>
					<span className="text-xs text-muted-foreground">
						{validOptionCount} selected
					</span>
				</div>

				{loadingProjects && (
					<div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
						Loading projects…
					</div>
				)}

				<div className="space-y-3">
					{optionRows.map((row, i) => (
						<div
							key={`option-row-${
								// biome-ignore lint/suspicious/noArrayIndexKey: index is intentional here
								i
							}`}
							className="border rounded-lg p-3 space-y-2.5"
						>
							<div className="flex items-center justify-between">
								<p className="text-xs font-medium text-muted-foreground">
									Option {i + 1}
								</p>
								{optionRows.length > 1 && (
									<button
										type="button"
										disabled={isPending}
										onClick={() =>
											onOptionRowsChange(
												optionRows.filter((_, idx) => idx !== i),
											)
										}
										className="text-destructive hover:opacity-70 disabled:opacity-30"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</button>
								)}
							</div>

							<div className="space-y-1">
								<Label className="text-xs">Project *</Label>
								<ProjectPicker
									projects={projects}
									selectedId={row.projectId}
									onSelect={(p) => onProjectSelect(i, p)}
									disabled={loadingProjects || isPending}
								/>
							</div>

							{row.projectId && (
								<>
									<div className="space-y-1">
										<Label className="text-xs">
											Option title
											<span className="text-muted-foreground ml-1 font-normal">
												(auto-filled, editable)
											</span>
										</Label>
										<Input
											placeholder="Campaign or project name"
											value={row.title}
											disabled={isPending}
											onChange={(e) =>
												updateRow(i, { title: e.target.value })
											}
										/>
									</div>

									<div className="space-y-1">
										<Label className="text-xs">
											Notes for voters
											<span className="text-muted-foreground ml-1 font-normal">
												(optional)
											</span>
										</Label>
										<Textarea
											placeholder="Why should the community fund this project?"
											value={row.description}
											rows={2}
											disabled={isPending}
											onChange={(e) =>
												updateRow(i, { description: e.target.value })
											}
										/>
									</div>
								</>
							)}
						</div>
					))}

					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={isPending}
						className="w-full gap-1.5"
						onClick={() =>
							onOptionRowsChange([...optionRows, { ...EMPTY_ROW }])
						}
					>
						<Plus className="h-3.5 w-3.5" />
						Add Option
					</Button>
				</div>
			</div>
		</div>
	)
}
