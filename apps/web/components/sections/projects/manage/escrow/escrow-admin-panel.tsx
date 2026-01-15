'use client'

import type {
	EscrowType,
	InitializeMultiReleaseEscrowPayload,
	InitializeSingleReleaseEscrowPayload,
} from '@trustless-work/escrow'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { saveEscrowContractAction } from '~/app/actions/escrow/save-escrow-contract'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { RadioGroup, RadioGroupItem } from '~/components/base/radio-group'
import { Textarea } from '~/components/base/textarea'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'

export function EscrowAdminPanel({
	projectId,
	projectSlug,
	escrowContractAddress,
	escrowType,
}: {
	projectId: string
	projectSlug: string
	escrowContractAddress?: string
	escrowType?: EscrowType
}) {
	const router = useRouter()
	const {
		deployEscrow,
		approveMilestone,
		changeMilestoneStatus,
		sendTransaction,
	} = useEscrow()
	const { isConnected, connect, address, signTransaction } = useWallet()

	// form state
	const [selectedEscrowType, setSelectedEscrowType] = useState<EscrowType>(
		escrowType || 'single-release',
	)
	const [title, setTitle] = useState('')
	const [engagementId, setEngagementId] = useState<string>('')
	const [trustlineAddress, setTrustlineAddress] = useState<string>('')
	const [approver, setApprover] = useState<string>('')
	const [serviceProvider, setServiceProvider] = useState<string>('')
	const [releaseSigner, setReleaseSigner] = useState<string>('')
	const [disputeResolver, setDisputeResolver] = useState<string>('')
	const [platformAddress, setPlatformAddress] = useState<string>('')
	const [receiver, setReceiver] = useState<string>('')
	const [platformFee, setPlatformFee] = useState<number | ''>('')
	const [amount, setAmount] = useState<number | ''>('')
	const [receiverMemo, setReceiverMemo] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	type MilestoneItem =
		| { id: string; description: string }
		| {
				id: string
				description: string
				amount: number | ''
				receiver: string
		  }
	const genId = () =>
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? crypto.randomUUID()
			: `m-${Date.now()}-${Math.random().toString(36).slice(2)}`
	const [milestones, setMilestones] = useState<MilestoneItem[]>(() => {
		const initialType = escrowType || 'single-release'
		if (initialType === 'multi-release') {
			return [
				{
					id: genId(),
					description: 'Milestone 1',
					amount: '',
					receiver: '',
				},
			]
		}
		return [{ id: genId(), description: 'Milestone 1' }]
	})

	// admin actions state
	const [milestoneIndex, _setMilestoneIndex] = useState('0')
	const titleId = useId()
	const amountId = useId()
	const _milestoneId = useId()
	const engagementIdInputId = useId()
	const escrowTypeLabelId = useId()
	const trustlineAddressId = useId()
	const approverId = useId()
	const spId = useId()
	const releaseSignerId = useId()
	const disputeResolverId = useId()
	const platformAddressId = useId()
	const receiverId = useId()
	const platformFeeId = useId()
	const receiverMemoId = useId()
	const descriptionId = useId()
	const singleReleaseRadioId = useId()
	const multiReleaseRadioId = useId()

	const ensureWallet = async () => {
		if (!isConnected) await connect()
		if (!address) throw new Error('Wallet address missing')
		return address
	}

	const areRequiredFieldsValid = useMemo(() => {
		const baseValid =
			title.trim().length > 0 &&
			(engagementId || `project-${projectId}`).trim().length > 0 &&
			trustlineAddress.trim().length > 0 &&
			approver.trim().length > 0 &&
			serviceProvider.trim().length > 0 &&
			releaseSigner.trim().length > 0 &&
			disputeResolver.trim().length > 0 &&
			platformAddress.trim().length > 0 &&
			typeof platformFee === 'number' &&
			Number.isFinite(platformFee) &&
			description.trim().length > 0 &&
			milestones.filter((m) => m.description.trim().length > 0).length > 0

		if (selectedEscrowType === 'single-release') {
			return (
				baseValid &&
				receiver.trim().length > 0 &&
				typeof amount === 'number' &&
				Number.isFinite(amount)
			)
		}
		// Multi-release: validate milestones have amount and receiver
		return (
			baseValid &&
			milestones.every((m) => {
				if ('amount' in m && 'receiver' in m) {
					return (
						typeof m.amount === 'number' &&
						Number.isFinite(m.amount) &&
						m.amount > 0 &&
						m.receiver.trim().length > 0
					)
				}
				return false
			})
		)
	}, [
		title,
		engagementId,
		projectId,
		trustlineAddress,
		approver,
		serviceProvider,
		releaseSigner,
		disputeResolver,
		platformAddress,
		receiver,
		platformFee,
		amount,
		description,
		milestones,
		selectedEscrowType,
	])

	const handleAddMilestone = () => {
		if (selectedEscrowType === 'multi-release') {
			setMilestones((prev) => [
				...prev,
				{
					id: genId(),
					description: `Milestone ${prev.length + 1}`,
					amount: '',
					receiver: '',
				},
			])
		} else {
			setMilestones((prev) => [
				...prev,
				{ id: genId(), description: `Milestone ${prev.length + 1}` },
			])
		}
	}

	const handleRemoveMilestone = (id: string) => {
		setMilestones((prev) => prev.filter((m) => m.id !== id))
	}

	const handleCreateEscrow = async () => {
		try {
			const signer = await ensureWallet()
			if (!areRequiredFieldsValid) {
				toast.error('Please complete all required fields')
				return
			}
			const effectiveEngagementId = (
				engagementId || `project-${projectId}`
			).trim()
			const composedDescription =
				receiverMemo.trim().length > 0
					? `${description.trim()}\nReceiver Memo: ${receiverMemo.trim()}`
					: description.trim()

			if (selectedEscrowType === 'single-release') {
				const sanitizedMilestones = milestones
					.map((m) => m.description)
					.filter((desc) => desc.trim().length > 0)
					.map((desc) => ({ description: desc.trim() }))

				const payload: InitializeSingleReleaseEscrowPayload = {
					signer,
					engagementId: effectiveEngagementId,
					title: title.trim(),
					roles: {
						approver: approver.trim(),
						serviceProvider: serviceProvider.trim(),
						platformAddress: platformAddress.trim(),
						releaseSigner: releaseSigner.trim(),
						disputeResolver: disputeResolver.trim(),
						receiver: receiver.trim(),
					},
					description: composedDescription,
					amount: amount as number,
					platformFee: platformFee as number,
					trustline: {
						address: trustlineAddress.trim(),
						symbol: 'USDC',
					},
					milestones: sanitizedMilestones,
				}

				// 1) Execute function from Trustless Work -> returns unsigned XDR
				const deployResponse = await deployEscrow(payload, 'single-release')

				if (deployResponse.status !== 'SUCCESS') {
					throw new Error('Failed to create escrow')
				}

				if (!deployResponse.unsignedTransaction) {
					throw new Error('No unsigned transaction returned')
				}

				// 2) Sign transaction with wallet
				const signedXdr = await signTransaction(
					deployResponse.unsignedTransaction,
				)

				// 3) Send signed transaction
				const sendResult = await sendTransaction(signedXdr)
				if (sendResult?.status !== 'SUCCESS') {
					throw new Error('Transaction failed')
				}

				// 4) Save escrow contract ID to database
				if ('contractId' in sendResult && sendResult.contractId) {
					const saveResult = await saveEscrowContractAction({
						projectId,
						contractId: sendResult.contractId,
					})

					if (!saveResult.success) {
						console.error('Failed to save escrow:', saveResult.error)
						toast.error('Escrow created but failed to save to database', {
							description: saveResult.error,
						})
						return
					}
				}

				toast.success('Escrow successfully created and deployed!', {
					description:
						'The escrow contract has been initialized on the blockchain.',
				})

				// Redirect to manage page after a short delay to show the success message
				setTimeout(() => {
					router.push(`/projects/${projectSlug}/manage`)
				}, 1500)
			} else {
				// Multi-release escrow
				const sanitizedMilestones = milestones
					.filter((m) => m.description.trim().length > 0)
					.map((m) => {
						if ('amount' in m && 'receiver' in m) {
							return {
								description: m.description.trim(),
								amount: m.amount as number,
								receiver: m.receiver.trim(),
							}
						}
						throw new Error('Invalid milestone data for multi-release')
					})

				const payload: InitializeMultiReleaseEscrowPayload = {
					signer,
					engagementId: effectiveEngagementId,
					title: title.trim(),
					roles: {
						approver: approver.trim(),
						serviceProvider: serviceProvider.trim(),
						platformAddress: platformAddress.trim(),
						releaseSigner: releaseSigner.trim(),
						disputeResolver: disputeResolver.trim(),
						// Note: receiver is NOT in roles for multi-release
					},
					description: composedDescription,
					// Note: amount is NOT at top level for multi-release
					platformFee: platformFee as number,
					trustline: {
						address: trustlineAddress.trim(),
						symbol: 'USDC',
					},
					milestones: sanitizedMilestones,
				}

				// 1) Execute function from Trustless Work -> returns unsigned XDR
				const deployResponse = await deployEscrow(payload, 'multi-release')

				if (deployResponse.status !== 'SUCCESS') {
					throw new Error('Failed to create escrow')
				}

				if (!deployResponse.unsignedTransaction) {
					throw new Error('No unsigned transaction returned')
				}

				// 2) Sign transaction with wallet
				const signedXdr = await signTransaction(
					deployResponse.unsignedTransaction,
				)

				// 3) Send signed transaction
				const sendResult = await sendTransaction(signedXdr)
				if (sendResult?.status !== 'SUCCESS') {
					throw new Error('Transaction failed')
				}

				// 4) Save escrow contract ID to database
				if ('contractId' in sendResult && sendResult.contractId) {
					const saveResult = await saveEscrowContractAction({
						projectId,
						contractId: sendResult.contractId,
					})

					if (!saveResult.success) {
						console.error('Failed to save escrow:', saveResult.error)
						toast.error('Escrow created but failed to save to database', {
							description: saveResult.error,
						})
						return
					}
				}

				toast.success('Escrow successfully created and deployed!', {
					description:
						'The escrow contract has been initialized on the blockchain.',
				})

				// Redirect to manage page after a short delay to show the success message
				setTimeout(() => {
					router.push(`/projects/${projectSlug}/manage`)
				}, 1500)
			}
		} catch (e) {
			console.error(e)
			const errorMessage =
				e instanceof Error ? e.message : 'Failed to create escrow'
			toast.error(errorMessage)
		}
	}

	const _handleApproveMilestone = async () => {
		if (!escrowContractAddress)
			return toast.error('No escrow contract configured')
		try {
			const signer = await ensureWallet()
			const res = await approveMilestone(
				{
					contractId: escrowContractAddress,
					milestoneIndex,
					approver: signer,
				},
				(escrowType as EscrowType) || 'single-release',
			)
			if (res.status !== 'SUCCESS') throw new Error('Approve failed')
			toast.success(
				'Milestone approved (unsigned tx). Continue to sign & submit.',
			)
		} catch (e) {
			console.error(e)
			toast.error('Failed to approve milestone')
		}
	}

	const _handleChangeMilestoneStatus = async () => {
		if (!escrowContractAddress)
			return toast.error('No escrow contract configured')
		try {
			const signer = await ensureWallet()
			const res = await changeMilestoneStatus(
				{
					contractId: escrowContractAddress,
					milestoneIndex,
					newStatus: 'approved',
					newEvidence: 'Updated via admin panel',
					serviceProvider: signer,
				},
				(escrowType as EscrowType) || 'multi-release',
			)
			if (res.status !== 'SUCCESS') throw new Error('Update failed')
			toast.success(
				'Milestone status updated (unsigned tx). Continue to sign & submit.',
			)
		} catch (e) {
			console.error(e)
			toast.error('Failed to update milestone status')
		}
	}

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Escrow Admin</h1>
			<TooltipProvider>
				<div className="space-y-6">
					<div className="space-y-2">
						<div className="flex gap-2 items-center">
							<h2 className="text-lg font-semibold">
								Fill in the details of the Escrow
							</h2>
							<Tooltip>
								<TooltipTrigger className="text-xs underline">
									More information
								</TooltipTrigger>
								<TooltipContent>
									Provide all required fields to initialize the escrow.
								</TooltipContent>
							</Tooltip>
						</div>
						<p className="text-sm text-muted-foreground">
							Fill in the details below to set up a secure and reliable escrow
							agreement.
						</p>
					</div>

					<div className="grid gap-6">
						<div className="grid gap-2">
							<p className="text-sm font-medium" id={escrowTypeLabelId}>
								Change Escrow Type
							</p>
							<RadioGroup
								aria-labelledby={escrowTypeLabelId}
								value={selectedEscrowType}
								onValueChange={(val) => {
									const newType = val as EscrowType
									setSelectedEscrowType(newType)
									// Convert milestones when switching types
									if (newType === 'multi-release') {
										setMilestones((prev) =>
											prev.map((m) => {
												if ('amount' in m && 'receiver' in m) {
													return m
												}
												return {
													...m,
													amount: '',
													receiver: '',
												}
											}),
										)
									} else {
										setMilestones((prev) =>
											prev.map((m) => {
												if ('amount' in m && 'receiver' in m) {
													const { amount, receiver, ...rest } = m
													return rest
												}
												return m
											}),
										)
									}
								}}
								className="grid grid-cols-1 gap-3 sm:grid-cols-2"
							>
								<div className="flex gap-2 items-center p-3 rounded-md border">
									<RadioGroupItem
										id={singleReleaseRadioId}
										value="single-release"
									/>
									<label
										htmlFor={singleReleaseRadioId}
										className="text-sm font-medium"
									>
										Single Release Escrow
									</label>
								</div>
								<div className="flex gap-2 items-center p-3 rounded-md border">
									<RadioGroupItem
										id={multiReleaseRadioId}
										value="multi-release"
									/>
									<label
										htmlFor={multiReleaseRadioId}
										className="text-sm font-medium"
									>
										Multi Release Escrow
									</label>
								</div>
							</RadioGroup>
							<p className="text-xs text-muted-foreground">
								A {selectedEscrowType === 'single-release' ? 'single' : 'multi'}{' '}
								payment will be released upon completion of milestones.
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<label htmlFor={titleId} className="text-sm font-medium">
									Title <span className="text-destructive">*</span>
								</label>
								<Input
									id={titleId}
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Escrow title"
								/>
							</div>
							<div className="grid gap-2">
								<label
									htmlFor={engagementIdInputId}
									className="text-sm font-medium"
								>
									Engagement <span className="text-destructive">*</span>
								</label>
								<Input
									id={engagementIdInputId}
									value={engagementId}
									onChange={(e) => setEngagementId(e.target.value)}
									placeholder={`project-${projectId}`}
								/>
							</div>
							<div className="grid gap-2">
								<div className="flex gap-2 items-center">
									<label
										htmlFor={trustlineAddressId}
										className="text-sm font-medium"
									>
										Trustline Address{' '}
										<span className="text-destructive">*</span>
									</label>
									<Tooltip>
										<TooltipTrigger className="text-xs underline">
											More information
										</TooltipTrigger>
										<TooltipContent>
											The asset contract address (e.g., USDC contract address on
											Stellar).
										</TooltipContent>
									</Tooltip>
								</div>
								<Input
									id={trustlineAddressId}
									value={trustlineAddress}
									onChange={(e) => setTrustlineAddress(e.target.value)}
									placeholder="Asset contract address (e.g., USDC)"
								/>
							</div>
							<div className="grid gap-2">
								<label htmlFor={approverId} className="text-sm font-medium">
									Approver <span className="text-destructive">*</span>
								</label>
								<Input
									id={approverId}
									value={approver}
									onChange={(e) => setApprover(e.target.value)}
									placeholder="Enter approver address"
								/>
							</div>
							<div className="grid gap-2">
								<label htmlFor={spId} className="text-sm font-medium">
									Service Provider <span className="text-destructive">*</span>
								</label>
								<Input
									id={spId}
									value={serviceProvider}
									onChange={(e) => setServiceProvider(e.target.value)}
									placeholder="Enter service provider address"
								/>
							</div>
							<div className="grid gap-2">
								<label
									htmlFor={releaseSignerId}
									className="text-sm font-medium"
								>
									Release Signer <span className="text-destructive">*</span>
								</label>
								<Input
									id={releaseSignerId}
									value={releaseSigner}
									onChange={(e) => setReleaseSigner(e.target.value)}
									placeholder="Enter release signer address"
								/>
							</div>
							<div className="grid gap-2">
								<label
									htmlFor={disputeResolverId}
									className="text-sm font-medium"
								>
									Dispute Resolver <span className="text-destructive">*</span>
								</label>
								<Input
									id={disputeResolverId}
									value={disputeResolver}
									onChange={(e) => setDisputeResolver(e.target.value)}
									placeholder="Enter dispute resolver address"
								/>
							</div>
							<div className="grid gap-2">
								<label
									htmlFor={platformAddressId}
									className="text-sm font-medium"
								>
									Platform Address <span className="text-destructive">*</span>
								</label>
								<Input
									id={platformAddressId}
									value={platformAddress}
									onChange={(e) => setPlatformAddress(e.target.value)}
									placeholder="Enter platform address"
								/>
							</div>
							<div className="grid gap-2">
								<label htmlFor={receiverId} className="text-sm font-medium">
									Receiver <span className="text-destructive">*</span>
									{selectedEscrowType === 'multi-release' && (
										<span className="text-xs text-muted-foreground ml-2">
											(Not needed for multi-release)
										</span>
									)}
								</label>
								<Input
									id={receiverId}
									value={receiver}
									onChange={(e) => setReceiver(e.target.value)}
									placeholder="Enter receiver address"
									disabled={selectedEscrowType === 'multi-release'}
								/>
							</div>
							<div className="grid gap-2">
								<label htmlFor={platformFeeId} className="text-sm font-medium">
									Platform Fee <span className="text-destructive">*</span>
								</label>
								<Input
									id={platformFeeId}
									type="number"
									value={platformFee}
									onChange={(e) =>
										setPlatformFee(
											e.target.value === '' ? '' : Number(e.target.value),
										)
									}
									placeholder="Enter platform fee"
								/>
							</div>
							{selectedEscrowType === 'single-release' && (
								<div className="grid gap-2">
									<label htmlFor={amountId} className="text-sm font-medium">
										Amount <span className="text-destructive">*</span>
									</label>
									<Input
										id={amountId}
										type="number"
										value={amount}
										onChange={(e) =>
											setAmount(
												e.target.value === '' ? '' : Number(e.target.value),
											)
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
									value={receiverMemo}
									onChange={(e) => setReceiverMemo(e.target.value)}
									placeholder="Enter the escrow receiver Memo"
								/>
							</div>
							<div className="grid gap-2 sm:col-span-2">
								<label htmlFor={descriptionId} className="text-sm font-medium">
									Description <span className="text-destructive">*</span>
								</label>
								<Textarea
									id={descriptionId}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Escrow description"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<div className="flex gap-2 items-center">
									<h3 className="text-sm font-medium">
										Milestones <span className="text-destructive">*</span>
									</h3>
									<Tooltip>
										<TooltipTrigger className="text-xs underline">
											More information
										</TooltipTrigger>
										<TooltipContent>
											{selectedEscrowType === 'multi-release'
												? 'For multi-release escrows, each milestone must have an amount and receiver address.'
												: 'Provide one or more milestone descriptions.'}
										</TooltipContent>
									</Tooltip>
								</div>
								<Button
									onClick={handleAddMilestone}
									variant="outline"
									className="px-2 h-8"
								>
									<Plus className="w-4 h-4" /> Add Item
								</Button>
							</div>
							<div className="space-y-3">
								{milestones.map((m, i) => {
									if (selectedEscrowType === 'multi-release') {
										if ('amount' in m && 'receiver' in m) {
											return (
												<div
													key={m.id}
													className="p-4 rounded-lg border bg-card space-y-3"
												>
													<div className="flex items-center justify-between">
														<span className="text-sm font-medium">
															Milestone {i + 1}
														</span>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleRemoveMilestone(m.id)}
															className="h-8 w-8 p-0"
															aria-label={`Remove milestone ${i + 1}`}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>
													<div className="grid gap-3 sm:grid-cols-3">
														<div className="sm:col-span-3">
															<Label className="text-xs text-muted-foreground">
																Description
															</Label>
															<Input
																value={m.description}
																onChange={(e) =>
																	setMilestones((prev) =>
																		prev.map((val, idx) =>
																			idx === i
																				? {
																						...val,
																						description: e.target.value,
																					}
																				: val,
																		),
																	)
																}
																placeholder="Milestone description"
															/>
														</div>
														<div>
															<Label className="text-xs text-muted-foreground">
																Amount{' '}
																<span className="text-destructive">*</span>
															</Label>
															<Input
																type="number"
																value={m.amount}
																onChange={(e) =>
																	setMilestones((prev) =>
																		prev.map((val, idx) =>
																			idx === i &&
																			'amount' in val &&
																			'receiver' in val
																				? {
																						...val,
																						amount:
																							e.target.value === ''
																								? ''
																								: Number(e.target.value),
																					}
																				: val,
																		),
																	)
																}
																placeholder="0.00"
																min="0"
																step="0.01"
															/>
														</div>
														<div className="sm:col-span-2">
															<Label className="text-xs text-muted-foreground">
																Receiver Address{' '}
																<span className="text-destructive">*</span>
															</Label>
															<Input
																value={m.receiver}
																onChange={(e) =>
																	setMilestones((prev) =>
																		prev.map((val, idx) =>
																			idx === i &&
																			'amount' in val &&
																			'receiver' in val
																				? {
																						...val,
																						receiver: e.target.value,
																					}
																				: val,
																		),
																	)
																}
																placeholder="Enter Stellar address"
															/>
														</div>
													</div>
												</div>
											)
										}
									}
									// Single release milestone
									return (
										<div key={m.id} className="flex gap-2 items-center">
											<Input
												value={m.description}
												onChange={(e) =>
													setMilestones((prev) =>
														prev.map((val, idx) =>
															idx === i
																? { ...val, description: e.target.value }
																: val,
														),
													)
												}
												placeholder="Milestone Description"
											/>
											<Button
												variant="ghost"
												onClick={() => handleRemoveMilestone(m.id)}
												className="p-0 w-8 h-8"
												aria-label={`Remove milestone ${i + 1}`}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									)
								})}
							</div>
						</div>

						<div className="flex gap-3 pt-4">
							<Button
								onClick={handleCreateEscrow}
								disabled={!areRequiredFieldsValid}
								className="px-6 py-2 font-semibold text-white bg-gradient-to-r rounded-lg shadow-md transition-colors duration-200 from-primary to-secondary hover:from-secondary hover:to-primary disabled:opacity-60 disabled:cursor-not-allowed"
								size="lg"
							>
								<Plus className="mr-2 w-4 h-4" />
								Initialize Escrow
							</Button>
						</div>
					</div>
				</div>
			</TooltipProvider>

			<div className="h-px bg-gray-200" />
		</div>
	)
}
