'use client'

import { useId } from 'react'
import { Input } from '~/components/base/input'
import { useEscrowForm } from '../context/escrow-form-context'
import type { EscrowFormData } from '../types'

interface RoleFieldProps {
	id: string
	label: string
	field: keyof EscrowFormData
	placeholder: string
	disabled?: boolean
	hint?: string
}

function RoleField({ id, label, field, placeholder, disabled, hint }: RoleFieldProps) {
	const { formData, setField } = useEscrowForm()
	return (
		<div className="grid gap-2">
			<label htmlFor={id} className="text-sm font-medium">
				{label} <span className="text-destructive">*</span>
				{hint && (
					<span className="text-xs text-muted-foreground ml-2">{hint}</span>
				)}
			</label>
			<Input
				id={id}
				value={formData[field] as string}
				onChange={(e) => setField(field, e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
			/>
		</div>
	)
}

export function EscrowRoleFields() {
	const { formData } = useEscrowForm()
	const approverId = useId()
	const spId = useId()
	const releaseSignerId = useId()
	const disputeResolverId = useId()
	const platformAddressId = useId()
	const receiverId = useId()

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<RoleField
				id={approverId}
				label="Approver"
				field="approver"
				placeholder="Enter approver address"
			/>
			<RoleField
				id={spId}
				label="Service Provider"
				field="serviceProvider"
				placeholder="Enter service provider address"
			/>
			<RoleField
				id={releaseSignerId}
				label="Release Signer"
				field="releaseSigner"
				placeholder="Enter release signer address"
			/>
			<RoleField
				id={disputeResolverId}
				label="Dispute Resolver"
				field="disputeResolver"
				placeholder="Enter dispute resolver address"
			/>
			<RoleField
				id={platformAddressId}
				label="Platform Address"
				field="platformAddress"
				placeholder="Enter platform address"
			/>
			<RoleField
				id={receiverId}
				label="Receiver"
				field="receiver"
				placeholder="Enter receiver address"
				disabled={formData.selectedEscrowType === 'multi-release'}
				hint={
					formData.selectedEscrowType === 'multi-release'
						? '(Not needed for multi-release)'
						: undefined
				}
			/>
		</div>
	)
}
