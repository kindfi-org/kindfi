'use client'

import { Link2, Send, Shield, Users, Wallet } from 'lucide-react'
import { useId } from 'react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/base/tooltip'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { isExternalStellarWalletAddress } from '~/lib/utils/escrow/trustless-signer'
import { useEscrowForm } from '../context/escrow-form-context'
import type { EscrowFormData } from '../types'

interface RoleFieldConfig {
	id: string
	label: string
	field: keyof EscrowFormData
	placeholder: string
	disabled?: boolean
	hint?: string
	icon: typeof Shield
	tooltip: string
}

function RoleField({
	id,
	label,
	field,
	placeholder,
	disabled,
	hint,
	icon: Icon,
	tooltip,
}: RoleFieldConfig) {
	const { formData, setField } = useEscrowForm()

	return (
		<div className="grid gap-2">
			<div className="flex items-center gap-2">
				<label htmlFor={id} className="text-sm font-medium">
					{label} <span className="text-destructive">*</span>
				</label>
				<Tooltip>
					<TooltipTrigger
						type="button"
						className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
						aria-label={`About ${label}`}
					>
						<Icon className="h-3.5 w-3.5" aria-hidden="true" />
					</TooltipTrigger>
					<TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
				</Tooltip>
				{hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
			</div>
			<Input
				id={id}
				name={`escrow-role-${field}`}
				autoComplete="off"
				spellCheck={false}
				value={formData[field] as string}
				onChange={(e) => setField(field, e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				className="font-mono text-xs"
			/>
		</div>
	)
}

export function EscrowRoleFields() {
	const { formData, fillRolesFromWallet } = useEscrowForm()
	const { address } = useWallet()
	const canFillFromWallet = isExternalStellarWalletAddress(address)

	const approverId = useId()
	const spId = useId()
	const releaseSignerId = useId()
	const disputeResolverId = useId()
	const platformAddressId = useId()
	const receiverId = useId()

	return (
		<TooltipProvider>
			<div className="space-y-4">
				<div className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<p className="text-sm font-medium">Quick fill from connected wallet</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Use your external Stellar wallet (G-address) for every role. You can edit individual
							fields afterward.
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={!canFillFromWallet}
						onClick={() => canFillFromWallet && fillRolesFromWallet(address)}
						className="shrink-0"
					>
						<Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
						Fill All Roles
					</Button>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<RoleField
						id={approverId}
						label="Approver"
						field="approver"
						icon={Shield}
						placeholder="G… approver address"
						tooltip="Verifies deliverables and approves milestones before funds can release."
					/>
					<RoleField
						id={spId}
						label="Service Provider"
						field="serviceProvider"
						icon={Users}
						placeholder="G… service provider address"
						tooltip="Delivers the work and updates milestone status on-chain."
					/>
					<RoleField
						id={releaseSignerId}
						label="Release Signer"
						field="releaseSigner"
						icon={Send}
						placeholder="G… release signer address"
						tooltip="Authorizes releasing escrow funds once milestones are approved."
					/>
					<RoleField
						id={disputeResolverId}
						label="Dispute Resolver"
						field="disputeResolver"
						icon={Shield}
						placeholder="G… dispute resolver address"
						tooltip="Resolves disagreements and decides whether to release or refund funds."
					/>
					<RoleField
						id={platformAddressId}
						label="Platform Address"
						field="platformAddress"
						icon={Wallet}
						placeholder="G… platform address"
						tooltip="Receives the platform fee configured in the previous step."
					/>
					<RoleField
						id={receiverId}
						label="Receiver"
						field="receiver"
						icon={Wallet}
						placeholder="G… receiver address"
						disabled={formData.selectedEscrowType === 'multi-release'}
						hint={
							formData.selectedEscrowType === 'multi-release'
								? '(Set per milestone instead)'
								: undefined
						}
						tooltip="Final recipient of funds for single-release escrows."
					/>
				</div>
			</div>
		</TooltipProvider>
	)
}
