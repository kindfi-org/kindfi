'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '~/components/base/alert'
import { Button } from '~/components/base/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { Textarea } from '~/components/base/textarea'
import type { EditRelease, NewRelease } from '~/lib/utils/escrow/build-update-escrow-payload'

export type ReleaseFormValues = NewRelease | EditRelease

interface AddReleaseDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	escrowType: EscrowType
	isSubmitting: boolean
	onSubmit: (release: ReleaseFormValues) => void
	mode?: 'add' | 'edit'
	initialValues?: ReleaseFormValues
	releaseLabel?: string
}

export function AddReleaseDialog({
	open,
	onOpenChange,
	escrowType,
	isSubmitting,
	onSubmit,
	mode = 'add',
	initialValues,
	releaseLabel,
}: AddReleaseDialogProps) {
	const isMulti = escrowType === 'multi-release'
	const isEdit = mode === 'edit'
	const [description, setDescription] = useState('')
	const [amount, setAmount] = useState('')
	const [receiver, setReceiver] = useState('')

	useEffect(() => {
		if (!open) {
			return
		}

		if (isEdit && initialValues) {
			setDescription(initialValues.description)
			if (isMulti && 'amount' in initialValues) {
				setAmount(String(initialValues.amount))
				setReceiver(initialValues.receiver)
			} else {
				setAmount('')
				setReceiver('')
			}
			return
		}

		setDescription('')
		setAmount('')
		setReceiver('')
	}, [open, isEdit, initialValues, isMulti])

	const resetForm = () => {
		setDescription('')
		setAmount('')
		setReceiver('')
	}

	const handleOpenChange = (next: boolean) => {
		if (!next && !isSubmitting) {
			resetForm()
		}
		onOpenChange(next)
	}

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()

		if (isMulti) {
			const parsedAmount = Number(amount)
			onSubmit({
				description,
				amount: parsedAmount,
				receiver,
			})
			return
		}

		onSubmit({ description })
	}

	const title = isEdit ? `Edit ${releaseLabel ?? 'release'}` : 'Add release'
	const submitLabel = isEdit ? 'Save changes' : 'Add release'
	const submittingLabel = isEdit ? 'Saving…' : 'Adding…'

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{isEdit
							? isMulti
								? 'Update this release’s description, amount, or receiver. Approved releases cannot be edited.'
								: 'Update this release’s description. Approved releases cannot be edited.'
							: isMulti
								? 'Add a new payment release with its own amount and receiver. The platform wallet must sign this update.'
								: 'Add a new deliverable release to the escrow. Funds still release together once all releases are approved.'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="release-description">Description</Label>
						<Textarea
							id="release-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="What work or deliverable does this release cover?"
							disabled={isSubmitting}
							className="min-h-[80px] resize-none"
							required
						/>
					</div>

					{isMulti ? (
						<>
							<div className="space-y-2">
								<Label htmlFor="release-amount">Amount (USDC)</Label>
								<Input
									id="release-amount"
									type="number"
									inputMode="decimal"
									min="0"
									step="0.01"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="0.00"
									disabled={isSubmitting}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="release-receiver">Receiver address</Label>
								<Input
									id="release-receiver"
									value={receiver}
									onChange={(e) => setReceiver(e.target.value)}
									placeholder="G… receiver with USDC trustline"
									className="font-mono text-xs"
									spellCheck={false}
									disabled={isSubmitting}
									required
								/>
							</div>
							{!isEdit ? (
								<Alert>
									<AlertTriangle className="h-4 w-4" aria-hidden="true" />
									<AlertDescription>
										After adding a release, fund the escrow with enough USDC to cover the new amount
										plus platform fees before approving and releasing.
									</AlertDescription>
								</Alert>
							) : null}
						</>
					) : null}

					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
									{submittingLabel}
								</>
							) : (
								submitLabel
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
