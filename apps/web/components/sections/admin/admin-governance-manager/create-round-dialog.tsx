'use client'

import { Check, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/base/dialog'
import { ConfirmActionDialog } from '~/components/sections/admin/shared/confirm-action-dialog'
import { useStellarNetworkConfig } from '~/hooks/contexts/stellar-network.context'
import { EMPTY_ROW } from './constants'
import { CreateRoundForm } from './create-round-form'
import { CreateRoundSuccess } from './create-round-success'
import {
	type CreateRoundForm as CreateRoundFormState,
	useCreateRound,
} from './hooks/use-create-round'
import { useProjectsList } from './hooks/use-projects-list'
import type { CreateRoundResult, OptionRow, ProjectSummary } from './types'

const INITIAL_FORM: CreateRoundFormState = {
	title: '',
	description: '',
	startsAt: '',
	endsAt: '',
	totalFundAmount: '',
	fundCurrency: 'XLM',
}

interface CreateRoundDialogProps {
	onCreated: () => void
}

export const CreateRoundDialog = ({ onCreated }: CreateRoundDialogProps) => {
	const [open, setOpen] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const { networkId } = useStellarNetworkConfig()
	const [result, setResult] = useState<CreateRoundResult | null>(null)
	const [form, setForm] = useState(INITIAL_FORM)
	const [optionRows, setOptionRows] = useState<OptionRow[]>([{ ...EMPTY_ROW }])

	const { projects, isLoading: loadingProjects } = useProjectsList(open)

	const resetForm = () => {
		setForm(INITIAL_FORM)
		setOptionRows([{ ...EMPTY_ROW }])
		setResult(null)
	}

	const handleClose = () => {
		if (result) onCreated()
		setOpen(false)
		resetForm()
	}

	const { mutate: createRound, isPending } = useCreateRound((data) => {
		setConfirmOpen(false)
		setResult(data)
	})

	const handleProjectSelect = (i: number, project: ProjectSummary) => {
		setOptionRows((rows) =>
			rows.map((r, idx) =>
				idx === i
					? {
							...r,
							projectId: project.id,
							title: project.title,
							projectSlug: project.slug,
							description: project.description ?? '',
						}
					: r,
			),
		)
	}

	const validOptionCount = optionRows.filter((r) => r.title.trim()).length
	const canSubmit =
		!isPending && !result && form.title && form.startsAt && form.endsAt && validOptionCount > 0

	return (
		<Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
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

				{result ? (
					<CreateRoundSuccess result={result} />
				) : (
					<CreateRoundForm
						form={form}
						onFormChange={(patch) => setForm({ ...form, ...patch })}
						optionRows={optionRows}
						onOptionRowsChange={setOptionRows}
						onProjectSelect={handleProjectSelect}
						projects={projects}
						loadingProjects={loadingProjects}
						isPending={isPending}
						validOptionCount={validOptionCount}
					/>
				)}

				<DialogFooter>
					{result ? (
						<Button onClick={handleClose} className="gap-2">
							<Check className="h-4 w-4" />
							Done
						</Button>
					) : (
						<>
							<Button variant="outline" onClick={handleClose} disabled={isPending}>
								Cancel
							</Button>
							<Button onClick={() => setConfirmOpen(true)} disabled={!canSubmit}>
								{isPending ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Confirming on blockchain…
									</>
								) : (
									'Create Round'
								)}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>

			<ConfirmActionDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Create governance round"
				description="This creates the round in the database and records it on-chain via the platform service account."
				summary={[
					{ label: 'Title', value: form.title },
					{ label: 'Voting window', value: `${form.startsAt} → ${form.endsAt}` },
					{ label: 'Options', value: String(validOptionCount) },
					...(form.totalFundAmount
						? [{ label: 'Fund', value: `${form.totalFundAmount} ${form.fundCurrency}` }]
						: []),
				]}
				blockchain={{ networkId }}
				confirmLabel="Create round"
				pendingLabel="Creating…"
				isPending={isPending}
				onConfirm={() => createRound({ form, optionRows })}
			/>
		</Dialog>
	)
}
