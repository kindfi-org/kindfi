'use client'

import { useId } from 'react'
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/base/tooltip'
import { useEscrowForm } from '../context/escrow-form-context'

interface EscrowBasicFieldsProps {
	projectId: string
}

export function EscrowBasicFields({ projectId }: EscrowBasicFieldsProps) {
	const { formData, setField } = useEscrowForm()
	const titleId = useId()
	const engagementIdId = useId()
	const trustlineId = useId()
	const platformFeeId = useId()
	const amountId = useId()
	const receiverMemoId = useId()
	const descriptionId = useId()

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<div className="grid gap-2">
				<label htmlFor={titleId} className="text-sm font-medium">
					Title <span className="text-destructive">*</span>
				</label>
				<Input
					id={titleId}
					value={formData.title}
					onChange={(e) => setField('title', e.target.value)}
					placeholder="Escrow title"
				/>
			</div>

			<div className="grid gap-2">
				<label htmlFor={engagementIdId} className="text-sm font-medium">
					Engagement <span className="text-destructive">*</span>
				</label>
				<Input
					id={engagementIdId}
					value={formData.engagementId}
					onChange={(e) => setField('engagementId', e.target.value)}
					placeholder={`project-${projectId}`}
				/>
			</div>

			<div className="grid gap-2">
				<div className="flex gap-2 items-center">
					<label htmlFor={trustlineId} className="text-sm font-medium">
						Trustline Address <span className="text-destructive">*</span>
					</label>
					<Tooltip>
						<TooltipTrigger className="text-xs underline">
							More information
						</TooltipTrigger>
						<TooltipContent>
							The asset contract address for the trustline. For USDC testnet
							(Soroban-wrapped), use:
							GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
						</TooltipContent>
					</Tooltip>
				</div>
				<Input
					id={trustlineId}
					value={formData.trustlineAddress}
					onChange={(e) => setField('trustlineAddress', e.target.value)}
					placeholder="Asset contract address (e.g., USDC Soroban contract)"
				/>
			</div>

			<div className="grid gap-2">
				<label htmlFor={platformFeeId} className="text-sm font-medium">
					Platform Fee <span className="text-destructive">*</span>
				</label>
				<Input
					id={platformFeeId}
					type="number"
					value={formData.platformFee}
					onChange={(e) =>
						setField('platformFee', e.target.value === '' ? '' : Number(e.target.value))
					}
					placeholder="Enter platform fee"
				/>
			</div>

			{formData.selectedEscrowType === 'single-release' && (
				<div className="grid gap-2">
					<label htmlFor={amountId} className="text-sm font-medium">
						Amount <span className="text-destructive">*</span>
					</label>
					<Input
						id={amountId}
						type="number"
						value={formData.amount}
						onChange={(e) =>
							setField('amount', e.target.value === '' ? '' : Number(e.target.value))
						}
						placeholder="Enter amount"
					/>
				</div>
			)}

			<div className="grid gap-2">
				<label htmlFor={receiverMemoId} className="text-sm font-medium">
					Receiver Memo (optional)
				</label>
				<Input
					id={receiverMemoId}
					value={formData.receiverMemo}
					onChange={(e) => setField('receiverMemo', e.target.value)}
					placeholder="Enter the escrow receiver Memo"
				/>
			</div>

			<div className="grid gap-2 sm:col-span-2">
				<label htmlFor={descriptionId} className="text-sm font-medium">
					Description <span className="text-destructive">*</span>
				</label>
				<Textarea
					id={descriptionId}
					value={formData.description}
					onChange={(e) => setField('description', e.target.value)}
					placeholder="Escrow description"
				/>
			</div>
		</div>
	)
}
