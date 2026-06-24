'use client'

import { Info } from 'lucide-react'
import { useId } from 'react'
import { Alert, AlertDescription } from '~/components/base/alert'
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/base/tooltip'
import { DEFAULT_USDC_CONTRACT_ADDRESS } from '~/lib/constants/escrow'
import { useEscrowForm } from '../context/escrow-form-context'

interface EscrowBasicFieldsProps {
	projectId: string
}

export function EscrowBasicFields({ projectId }: EscrowBasicFieldsProps) {
	const { formData, setField, suggestions } = useEscrowForm()
	const titleId = useId()
	const engagementIdId = useId()
	const trustlineId = useId()
	const platformFeeId = useId()
	const amountId = useId()
	const receiverMemoId = useId()
	const descriptionId = useId()

	const applySuggestedTitle = () => setField('title', suggestions.suggestedTitle)
	const applySuggestedEngagement = () => setField('engagementId', suggestions.suggestedEngagementId)
	const applySuggestedDescription = () => setField('description', suggestions.suggestedDescription)
	const useDefaultTrustline = () => setField('trustlineAddress', DEFAULT_USDC_CONTRACT_ADDRESS)

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="grid gap-2 sm:col-span-2">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<label htmlFor={titleId} className="text-sm font-medium">
							Escrow Title <span className="text-destructive">*</span>
						</label>
						{suggestions.suggestedTitle && formData.title !== suggestions.suggestedTitle ? (
							<button
								type="button"
								onClick={applySuggestedTitle}
								className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
							>
								Use suggested title
							</button>
						) : null}
					</div>
					<Input
						id={titleId}
						name="escrow-title"
						autoComplete="off"
						value={formData.title}
						onChange={(e) => setField('title', e.target.value)}
						placeholder="KindFi — Clean Water Initiative — 1…"
					/>
				</div>

				<div className="grid gap-2">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<label htmlFor={engagementIdId} className="text-sm font-medium">
							Engagement ID <span className="text-destructive">*</span>
						</label>
						{suggestions.suggestedEngagementId &&
						formData.engagementId !== suggestions.suggestedEngagementId ? (
							<button
								type="button"
								onClick={applySuggestedEngagement}
								className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
							>
								Use suggested ID
							</button>
						) : null}
					</div>
					<Input
						id={engagementIdId}
						name="escrow-engagement-id"
						autoComplete="off"
						spellCheck={false}
						value={formData.engagementId}
						onChange={(e) => setField('engagementId', e.target.value)}
						placeholder={`project-${projectId}…`}
					/>
					<p className="text-xs text-muted-foreground">
						Unique identifier Trustless Work uses to track this escrow.
					</p>
				</div>

				<div className="grid gap-2">
					<label htmlFor={platformFeeId} className="text-sm font-medium">
						Platform Fee (%) <span className="text-destructive">*</span>
					</label>
					<Input
						id={platformFeeId}
						name="escrow-platform-fee"
						type="number"
						inputMode="decimal"
						autoComplete="off"
						value={formData.platformFee}
						onChange={(e) =>
							setField('platformFee', e.target.value === '' ? '' : Number(e.target.value))
						}
						placeholder="2.5…"
						min="0"
						step="0.01"
					/>
				</div>

				<div className="grid gap-2 sm:col-span-2">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<label htmlFor={trustlineId} className="text-sm font-medium">
								Asset Contract (Trustline) <span className="text-destructive">*</span>
							</label>
							<Tooltip>
								<TooltipTrigger
									type="button"
									className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
									aria-label="More information about trustline address"
								>
									<Info className="h-4 w-4" aria-hidden="true" />
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									Soroban-wrapped USDC contract address used to fund and release this escrow.
								</TooltipContent>
							</Tooltip>
						</div>
						{formData.trustlineAddress !== DEFAULT_USDC_CONTRACT_ADDRESS ? (
							<button
								type="button"
								onClick={useDefaultTrustline}
								className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
							>
								Use default USDC
							</button>
						) : null}
					</div>
					<Input
						id={trustlineId}
						name="escrow-trustline"
						autoComplete="off"
						spellCheck={false}
						value={formData.trustlineAddress}
						onChange={(e) => setField('trustlineAddress', e.target.value)}
						placeholder="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5…"
						className="font-mono text-xs"
					/>
				</div>

				{formData.selectedEscrowType === 'single-release' ? (
					<div className="grid gap-2">
						<label htmlFor={amountId} className="text-sm font-medium">
							Total Escrow Amount <span className="text-destructive">*</span>
						</label>
						<Input
							id={amountId}
							name="escrow-amount"
							type="number"
							inputMode="decimal"
							autoComplete="off"
							value={formData.amount}
							onChange={(e) =>
								setField('amount', e.target.value === '' ? '' : Number(e.target.value))
							}
							placeholder="1000…"
							min="0"
							step="0.01"
						/>
					</div>
				) : null}

				<div className="grid gap-2">
					<label htmlFor={receiverMemoId} className="text-sm font-medium">
						Receiver Memo <span className="text-muted-foreground">(optional)</span>
					</label>
					<Input
						id={receiverMemoId}
						name="escrow-receiver-memo"
						autoComplete="off"
						spellCheck={false}
						value={formData.receiverMemo}
						onChange={(e) => setField('receiverMemo', e.target.value)}
						placeholder="Payment reference or note…"
					/>
				</div>

				<div className="grid gap-2 sm:col-span-2">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<label htmlFor={descriptionId} className="text-sm font-medium">
							Description <span className="text-destructive">*</span>
						</label>
						{suggestions.suggestedDescription &&
						formData.description !== suggestions.suggestedDescription ? (
							<button
								type="button"
								onClick={applySuggestedDescription}
								className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
							>
								Use project description
							</button>
						) : null}
					</div>
					<Textarea
						id={descriptionId}
						name="escrow-description"
						autoComplete="off"
						value={formData.description}
						onChange={(e) => setField('description', e.target.value)}
						placeholder="Describe what this escrow covers and how milestones map to deliverables…"
						rows={4}
					/>
				</div>
			</div>

			<Alert>
				<Info className="h-4 w-4" aria-hidden="true" />
				<AlertDescription>
					Fields marked with <span className="text-destructive">*</span> are required before you can
					deploy the escrow contract.
				</AlertDescription>
			</Alert>
		</div>
	)
}
