'use client'

import { useId } from 'react'
import { RadioGroup, RadioGroupItem } from '~/components/base/radio-group'
import { useEscrowForm } from '../context/escrow-form-context'

export function EscrowTypeSelector() {
	const { formData, convertMilestones } = useEscrowForm()
	const singleId = useId()
	const multiId = useId()
	const labelId = useId()

	return (
		<div className="grid gap-2">
			<p className="text-sm font-medium" id={labelId}>
				Change Escrow Type
			</p>
			<RadioGroup
				aria-labelledby={labelId}
				value={formData.selectedEscrowType}
				onValueChange={(val) =>
					convertMilestones(val as 'single-release' | 'multi-release')
				}
				className="grid grid-cols-1 gap-3 sm:grid-cols-2"
			>
				<div className="flex gap-2 items-center p-3 rounded-md border">
					<RadioGroupItem id={singleId} value="single-release" />
					<label htmlFor={singleId} className="text-sm font-medium">
						Single Release Escrow
					</label>
				</div>
				<div className="flex gap-2 items-center p-3 rounded-md border">
					<RadioGroupItem id={multiId} value="multi-release" />
					<label htmlFor={multiId} className="text-sm font-medium">
						Multi Release Escrow
					</label>
				</div>
			</RadioGroup>
			<p className="text-xs text-muted-foreground">
				A{' '}
				{formData.selectedEscrowType === 'single-release' ? 'single' : 'multi'}{' '}
				payment will be released upon completion of milestones.
			</p>
		</div>
	)
}
