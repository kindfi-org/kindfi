'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
	Calendar,
	Check,
	ChevronDown,
	ChevronsUpDown,
	ChevronUp,
	CircleDashed,
	ExternalLink,
	Loader2,
	Plus,
	Trash2,
	Vote,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/base/command'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/base/dialog'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/base/popover'
import { Textarea } from '~/components/base/textarea'
import type {
	CreateOptionPayload,
	CreateRoundPayload,
	GovernanceOption,
	GovernanceRound,
} from '~/lib/governance/types'
import { cn } from '~/lib/utils'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'

// ============================================================================
// Types
// ============================================================================

interface ProjectSummary {
	id: string
	title: string
	slug: string
	image_url: string | null
	description: string | null
	category: { name: string } | null
}

interface OptionRow {
	projectId: string
	title: string
	description: string
	projectSlug: string
}

const EMPTY_ROW: OptionRow = {
	projectId: '',
	title: '',
	description: '',
	projectSlug: '',
}

const STATUS_CONFIG = {
	upcoming: { label: 'Upcoming', className: 'border-blue-300 text-blue-600' },
	active: { label: 'Active', className: 'border-green-400 text-green-700' },
	ended: { label: 'Ended', className: 'border-gray-300 text-gray-500' },
} as const

// ============================================================================
// ProjectPicker — searchable combobox
// ============================================================================

function ProjectPicker({
	projects,
	selectedId,
	onSelect,
	disabled,
}: {
	projects: ProjectSummary[]
	selectedId: string
	onSelect: (project: ProjectSummary) => void
	disabled?: boolean
}) {
	const [open, setOpen] = useState(false)
	const selected = projects.find((p) => p.id === selectedId)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={cn(
						'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background',
						'hover:bg-accent/40 focus:outline-none focus:ring-1 focus:ring-ring',
						'disabled:cursor-not-allowed disabled:opacity-50',
						!selected && 'text-muted-foreground',
					)}
				>
					<span className="truncate">
						{selected ? selected.title : 'Select a project…'}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[--radix-popover-trigger-width] p-0"
				align="start"
			>
				<Command>
					<CommandInput placeholder="Search projects…" className="h-9" />
					<CommandList>
						<CommandEmpty>No projects found.</CommandEmpty>
						<CommandGroup>
							{projects.map((project) => (
								<CommandItem
									key={project.id}
									value={`${project.title} ${project.slug}`}
									onSelect={() => {
										onSelect(project)
										setOpen(false)
									}}
									className="gap-2"
								>
									{project.image_url ? (
										// biome-ignore lint/performance/noImgElement: small thumbnail, no Next/Image needed
										<img
											src={project.image_url}
											alt=""
											className="h-6 w-6 rounded object-cover shrink-0"
										/>
									) : (
										<div className="h-6 w-6 rounded bg-muted shrink-0" />
									)}
									<div className="flex-1 min-w-0">
										<span className="block truncate font-medium">
											{project.title}
										</span>
										{project.category && (
											<span className="block text-xs text-muted-foreground truncate">
												{project.category.name} · /{project.slug}
											</span>
										)}
									</div>
									{selectedId === project.id && (
										<Check className="h-4 w-4 shrink-0 text-primary" />
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}

// ============================================================================
// Create Round Dialog
// ============================================================================

function CreateRoundDialog({ onCreated }: { onCreated: () => void }) {
	const [open, setOpen] = useState(false)
	const [form, setForm] = useState({
		title: '',
		description: '',
		startsAt: '',
		endsAt: '',
		totalFundAmount: '',
		fundCurrency: 'XLM',
	})
	const [optionRows, setOptionRows] = useState<OptionRow[]>([{ ...EMPTY_ROW }])

	const { data: projectsData, isLoading: loadingProjects } = useQuery<{
		success: boolean
		data: ProjectSummary[]
	}>({
		queryKey: ['projects-list'],
		queryFn: async () => {
			const res = await fetch('/api/projects')
			if (!res.ok) throw new Error('Failed to fetch projects')
			return res.json()
		},
		enabled: open,
		staleTime: 5 * 60 * 1000,
	})

	const projects = projectsData?.data ?? []

	const updateRow = (i: number, patch: Partial<OptionRow>) => {
		setOptionRows((rows) =>
			rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
		)
	}

	const handleProjectSelect = (i: number, project: ProjectSummary) => {
		updateRow(i, {
			projectId: project.id,
			title: project.title,
			projectSlug: project.slug,
			description: project.description ?? '',
		})
	}

	const handleClose = () => {
		setOpen(false)
		setForm({
			title: '',
			description: '',
			startsAt: '',
			endsAt: '',
			totalFundAmount: '',
			fundCurrency: 'XLM',
		})
		setOptionRows([{ ...EMPTY_ROW }])
	}

	const { mutate: createRound, isPending } = useMutation({
		mutationFn: async () => {
			const roundPayload: CreateRoundPayload = {
				title: form.title,
				description: form.description || undefined,
				startsAt: new Date(form.startsAt).toISOString(),
				endsAt: new Date(form.endsAt).toISOString(),
				totalFundAmount: Number(form.totalFundAmount) || 0,
				fundCurrency: form.fundCurrency,
			}

			const optionsPayload = optionRows
				.filter((r) => r.title.trim())
				.map(
					(r): Omit<CreateOptionPayload, 'roundId'> => ({
						title: r.title,
						description: r.description || undefined,
						projectSlug: r.projectSlug || undefined,
					}),
				)

			const res = await fetch('/api/governance/rounds', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ round: roundPayload, options: optionsPayload }),
			})

			const json = await res.json()
			if (!res.ok) throw new Error(json.error ?? 'Failed to create round')
			return json
		},
		onSuccess: () => {
			handleClose()
			onCreated()
		},
	})

	const validOptionCount = optionRows.filter((r) => r.title.trim()).length
	const canSubmit =
		!isPending &&
		form.title &&
		form.startsAt &&
		form.endsAt &&
		validOptionCount > 0

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
		>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-1.5">
					<Plus className="h-4 w-4" />
					New Round
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Governance Round</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{/* Round metadata */}
					<div className="space-y-1.5">
						<Label htmlFor="gr-title">Title *</Label>
						<Input
							id="gr-title"
							placeholder="Round #1 – Q1 2026"
							value={form.title}
							onChange={(e) => setForm({ ...form, title: e.target.value })}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="gr-desc">Description</Label>
						<Textarea
							id="gr-desc"
							placeholder="Describe the purpose of this voting round…"
							value={form.description}
							onChange={(e) =>
								setForm({ ...form, description: e.target.value })
							}
							rows={2}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label htmlFor="gr-starts">Starts At *</Label>
							<Input
								id="gr-starts"
								type="datetime-local"
								value={form.startsAt}
								onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="gr-ends">Ends At *</Label>
							<Input
								id="gr-ends"
								type="datetime-local"
								value={form.endsAt}
								onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
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
									setForm({ ...form, totalFundAmount: e.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="gr-currency">Currency</Label>
							<Input
								id="gr-currency"
								placeholder="XLM"
								value={form.fundCurrency}
								onChange={(e) =>
									setForm({ ...form, fundCurrency: e.target.value })
								}
							/>
						</div>
					</div>

					{/* Redistribution Options */}
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
												onClick={() =>
													setOptionRows(
														optionRows.filter((_, idx) => idx !== i),
													)
												}
												className="text-destructive hover:opacity-70"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										)}
									</div>

									{/* Project picker */}
									<div className="space-y-1">
										<Label className="text-xs">Project *</Label>
										<ProjectPicker
											projects={projects}
											selectedId={row.projectId}
											onSelect={(p) => handleProjectSelect(i, p)}
											disabled={loadingProjects}
										/>
									</div>

									{/* Title — auto-filled but editable */}
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
								className="w-full gap-1.5"
								onClick={() => setOptionRows([...optionRows, { ...EMPTY_ROW }])}
							>
								<Plus className="h-3.5 w-3.5" />
								Add Option
							</Button>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={isPending}>
						Cancel
					</Button>
					<Button onClick={() => createRound()} disabled={!canSubmit}>
						{isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Create Round
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

// ============================================================================
// Round Row
// ============================================================================

function RoundRow({ round }: { round: GovernanceRound }) {
	const [expanded, setExpanded] = useState(false)
	const statusConfig = STATUS_CONFIG[round.status]
	const options = round.options ?? []
	const totalVotes = options.reduce(
		(sum, o) => sum + (o.upvotes ?? 0) + (o.downvotes ?? 0),
		0,
	)

	return (
		<div className="border rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
			>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-medium text-sm">{round.title}</span>
						<Badge
							variant="outline"
							className={cn('text-xs', statusConfig.className)}
						>
							{statusConfig.label}
						</Badge>
						{/* On-chain status */}
						{round.contract_round_id != null ? (
							<a
								href={getStellarExplorerUrl(
									process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS ?? '',
								)}
								target="_blank"
								rel="noopener noreferrer"
								onClick={(e) => e.stopPropagation()}
								className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
							>
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								On-chain #{round.contract_round_id}
								<ExternalLink className="h-2.5 w-2.5" />
							</a>
						) : (
							<span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400">
								<span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
								Pending on-chain
							</span>
						)}
					</div>
					<div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
						<span className="flex items-center gap-1">
							<Calendar className="h-3 w-3" />
							{new Date(round.starts_at).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
							})}{' '}
							→{' '}
							{new Date(round.ends_at).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric',
							})}
						</span>
						<span>
							{options.length} option{options.length !== 1 ? 's' : ''}
						</span>
						<span>
							{totalVotes} vote{totalVotes !== 1 ? 's' : ''}
						</span>
						{round.total_fund_amount > 0 && (
							<span className="font-medium text-foreground">
								{Number(round.total_fund_amount).toLocaleString('en-US', {
									maximumFractionDigits: 0,
								})}{' '}
								{round.fund_currency}
							</span>
						)}
					</div>
				</div>
				{expanded ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
				)}
			</button>

			{expanded && options.length > 0 && (
				<div className="border-t px-4 py-3 space-y-2 bg-muted/20">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						Options
					</p>
					{options.map((opt: GovernanceOption) => (
						<div
							key={opt.id}
							className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-border/40 last:border-0"
						>
							<div className="min-w-0">
								<span className="font-medium">{opt.title}</span>
								{opt.project_slug && (
									<span className="text-xs text-muted-foreground ml-2">
										/{opt.project_slug}
									</span>
								)}
							</div>
							<div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
								<span>👍 {opt.upvotes}</span>
								<span>👎 {opt.downvotes}</span>
								{round.winner_option_id === opt.id && (
									<span className="text-yellow-600 font-semibold">
										🏆 Winner
									</span>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

// ============================================================================
// Main Manager
// ============================================================================

export function AdminGovernanceManager() {
	const queryClient = useQueryClient()

	const { data, isLoading } = useQuery<{
		success: boolean
		data: GovernanceRound[]
	}>({
		queryKey: ['governance-rounds'],
		queryFn: async () => {
			const res = await fetch('/api/governance/rounds')
			if (!res.ok) throw new Error('Failed to fetch rounds')
			return res.json()
		},
	})

	const rounds = data?.data ?? []
	const activeCount = rounds.filter(
		(r) => r.status === 'active' || r.status === 'upcoming',
	).length
	const endedCount = rounds.filter((r) => r.status === 'ended').length

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4 flex-wrap">
				<div>
					<h2 className="text-xl font-bold">Governance Rounds</h2>
					<p className="text-sm text-muted-foreground mt-0.5">
						Create and manage community fund voting rounds.
					</p>
				</div>
				<CreateRoundDialog
					onCreated={() =>
						queryClient.invalidateQueries({ queryKey: ['governance-rounds'] })
					}
				/>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-3 gap-3">
				{[
					{ label: 'Total Rounds', value: rounds.length },
					{ label: 'Active / Upcoming', value: activeCount },
					{ label: 'Ended', value: endedCount },
				].map((s) => (
					<Card key={s.label}>
						<CardContent className="p-4 text-center">
							<p className="text-2xl font-bold">{s.value}</p>
							<p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Rounds list */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Vote className="h-4 w-4 text-muted-foreground" />
						All Rounds
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
						</div>
					) : rounds.length === 0 ? (
						<div className="text-center py-10 text-muted-foreground">
							<CircleDashed className="h-10 w-10 mx-auto mb-3 opacity-30" />
							<p className="text-sm">No rounds yet. Create the first one!</p>
						</div>
					) : (
						rounds.map((round) => <RoundRow key={round.id} round={round} />)
					)}
				</CardContent>
			</Card>
		</div>
	)
}
