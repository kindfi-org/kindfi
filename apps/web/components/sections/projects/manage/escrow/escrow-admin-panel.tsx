'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import type {
	EscrowRequestResponse,
	EscrowType,
	InitializeMultiReleaseEscrowPayload,
	InitializeMultiReleaseEscrowResponse,
	InitializeSingleReleaseEscrowPayload,
	InitializeSingleReleaseEscrowResponse,
} from '@trustless-work/escrow'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useState } from 'react'
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
import { DEFAULT_USDC_CONTRACT_ADDRESS } from '~/lib/constants/escrow'
import { getEscrowCountByProject } from '~/lib/queries/escrow/get-escrow-count-by-project'
import { generateEngagementId, generateEscrowTitle } from '~/lib/utils/escrow'

export function EscrowAdminPanel({
	projectId,
	projectSlug,
	projectTitle,
	projectDescription,
	escrowContractAddress,
	escrowType,
}: {
	projectId: string
	projectSlug: string
	projectTitle?: string
	projectDescription?: string
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

	// Fetch escrow count to determine consecutive number
	const { data: escrowCount = 0 } = useSupabaseQuery(
		'escrow-count',
		(client) => getEscrowCountByProject(client, projectId),
		{ additionalKeyValues: [projectId] },
	)

	// Calculate consecutive number (existing escrows + 1)
	const consecutiveNumber = (escrowCount ?? 0) + 1

	// Generate pre-filled values from project data
	const suggestedTitle = useMemo(() => {
		if (projectTitle) {
			return generateEscrowTitle(projectTitle, consecutiveNumber)
		}
		return `Kindfi - Project ${projectId} - ${consecutiveNumber}`
	}, [projectTitle, projectId, consecutiveNumber])

	const suggestedDescription = useMemo(
		() => projectDescription || '',
		[projectDescription],
	)

	const suggestedEngagementId = useMemo(() => {
		if (projectTitle) {
			return generateEngagementId(projectTitle, consecutiveNumber)
		}
		return `Kindfi - project-${projectId} - ${consecutiveNumber}`
	}, [projectTitle, projectId, consecutiveNumber])

	// form state
	const [selectedEscrowType, setSelectedEscrowType] = useState<EscrowType>(
		escrowType || 'multi-release',
	)
	const [title, setTitle] = useState(suggestedTitle)
	const [engagementId, setEngagementId] = useState<string>(
		suggestedEngagementId,
	)
	const [trustlineAddress, setTrustlineAddress] = useState<string>(
		DEFAULT_USDC_CONTRACT_ADDRESS,
	)
	const [approver, setApprover] = useState<string>('')
	const [serviceProvider, setServiceProvider] = useState<string>('')
	const [releaseSigner, setReleaseSigner] = useState<string>('')
	const [disputeResolver, setDisputeResolver] = useState<string>('')
	const [platformAddress, setPlatformAddress] = useState<string>('')
	const [receiver, setReceiver] = useState<string>('')
	const [platformFee, setPlatformFee] = useState<number | ''>('')
	const [amount, setAmount] = useState<number | ''>('')
	const [receiverMemo, setReceiverMemo] = useState<string>('')
	const [description, setDescription] = useState<string>(suggestedDescription)

	// Sync pre-filled values when project data changes (only if fields are empty)
	useEffect(() => {
		if (!title.trim() && suggestedTitle) {
			setTitle(suggestedTitle)
		}
	}, [suggestedTitle, title])

	useEffect(() => {
		if (!engagementId.trim() && suggestedEngagementId) {
			setEngagementId(suggestedEngagementId)
		}
	}, [suggestedEngagementId, engagementId])

	useEffect(() => {
		if (!description.trim() && suggestedDescription) {
			setDescription(suggestedDescription)
		}
	}, [suggestedDescription, description])

	// Sync role fields with connected wallet address
	useEffect(() => {
		if (address) {
			// Pre-fill role fields with connected wallet address if they're empty
			if (!approver.trim()) setApprover(address)
			if (!serviceProvider.trim()) setServiceProvider(address)
			if (!releaseSigner.trim()) setReleaseSigner(address)
			if (!disputeResolver.trim()) setDisputeResolver(address)
			if (!platformAddress.trim()) setPlatformAddress(address)
			if (!receiver.trim()) setReceiver(address)
		}
	}, [
		address,
		approver,
		serviceProvider,
		releaseSigner,
		disputeResolver,
		platformAddress,
		receiver,
	])
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
		const initialType = escrowType || 'multi-release'
		if (initialType === 'multi-release') {
			return [
				{
					id: genId(),
					description: 'Milestone 1',
					amount: '',
					// Pre-fill with connected wallet address if available
					receiver: address || '',
				},
			]
		}
		return [{ id: genId(), description: 'Milestone 1' }]
	})

	// Update milestone receivers when wallet address changes
	useEffect(() => {
		if (address && selectedEscrowType === 'multi-release') {
			setMilestones((prev) =>
				prev.map((m) => {
					if ('receiver' in m && !m.receiver.trim()) {
						return { ...m, receiver: address }
					}
					return m
				}),
			)
		}
	}, [address, selectedEscrowType])

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
					// Pre-fill with connected wallet address if available
					receiver: address || '',
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
			// Ensure wallet is connected (Stellar Wallets Kit)
			if (!isConnected) {
				await connect()
			}
			if (!address) {
				toast.error('Please connect a Stellar wallet to continue')
				return
			}

			const signer = address

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

				// Validate payload before sending
				console.log('📤 Sending single-release escrow payload:', {
					hasSigner: !!payload.signer,
					hasEngagementId: !!payload.engagementId,
					hasTitle: !!payload.title,
					hasRoles: !!payload.roles,
					hasDescription: !!payload.description,
					hasAmount: typeof payload.amount === 'number' && payload.amount > 0,
					hasPlatformFee: typeof payload.platformFee === 'number',
					hasTrustline: !!payload.trustline,
					milestonesCount: payload.milestones.length,
					payload: JSON.stringify(payload, null, 2),
				})

				// Validate amount
				if (!payload.amount || payload.amount <= 0) {
					const errorMsg = 'Invalid amount: Amount must be greater than 0'
					console.error('❌ Invalid amount:', payload.amount)
					toast.error('Invalid amount', {
						description: errorMsg,
					})
					throw new Error(errorMsg)
				}

				// 1) Execute function from Trustless Work -> returns unsigned XDR
				let deployResponse: EscrowRequestResponse
				try {
					deployResponse = await deployEscrow(payload, 'single-release')
				} catch (error) {
					console.error('❌ deployEscrow error:', error)
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to create escrow: API request failed'
					toast.error('Failed to deploy escrow', {
						description: errorMessage,
					})
					throw new Error(errorMessage)
				}

				if (!deployResponse || deployResponse.status !== 'SUCCESS') {
					const errorMsg =
						'Escrow deployment failed: Invalid request or API error'
					console.error('❌ deployEscrow failed:', {
						status: deployResponse?.status,
						response: deployResponse,
					})
					toast.error('Failed to deploy escrow', {
						description: errorMsg,
					})
					throw new Error(errorMsg)
				}

				if (!deployResponse.unsignedTransaction) {
					console.error(
						'❌ No unsigned transaction in response:',
						deployResponse,
					)
					toast.error('Failed to deploy escrow', {
						description: 'No unsigned transaction returned from API',
					})
					throw new Error('No unsigned transaction returned')
				}

				// 2) Sign transaction with Stellar Wallets Kit
				let signedXdr: string
				try {
					signedXdr = await signTransaction(deployResponse.unsignedTransaction)
				} catch (error) {
					console.error('❌ signTransaction error:', error)
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to sign transaction'
					toast.error('Failed to sign transaction', {
						description: errorMessage,
					})
					throw new Error(errorMessage)
				}

				// 3) Send signed transaction
				let sendResult:
					| InitializeSingleReleaseEscrowResponse
					| InitializeMultiReleaseEscrowResponse
					| { status: string }
				try {
					sendResult = await sendTransaction(signedXdr)
				} catch (error) {
					console.error('❌ sendTransaction error:', error)
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to send transaction'
					toast.error('Failed to send transaction', {
						description: errorMessage,
					})
					throw new Error(errorMessage)
				}

				if (
					!sendResult ||
					(sendResult as { status?: string }).status !== 'SUCCESS'
				) {
					const status = (sendResult as { status?: string })?.status
					const errorMsg =
						status === 'ERROR'
							? 'Transaction submission failed'
							: 'Transaction failed: Invalid response'
					console.error('❌ sendTransaction failed:', {
						status,
						response: sendResult,
					})
					toast.error('Transaction failed', {
						description: errorMsg,
					})
					throw new Error(errorMsg)
				}

				// Get contract ID and escrow data from response
				// Use Record type to safely access properties
				const responseAny = sendResult as Record<string, unknown>
				const contractId =
					(responseAny.contractId as string | undefined) ||
					(responseAny.contract_id as string | undefined) ||
					undefined

				// Extract escrow data - the response has an 'escrow' property
				const escrowDataRaw = responseAny.escrow as
					| Record<string, unknown>
					| undefined
				const escrowData = escrowDataRaw
					? {
							engagementId: escrowDataRaw.engagementId as string | undefined,
							title: escrowDataRaw.title as string | undefined,
							description: escrowDataRaw.description as string | undefined,
							roles: escrowDataRaw.roles as
								| {
										approver?: string
										serviceProvider?: string
										disputeResolver?: string
										platformAddress?: string
										releaseSigner?: string
								  }
								| undefined,
							platformFee: escrowDataRaw.platformFee as number | undefined,
							milestones: escrowDataRaw.milestones as
								| Array<{
										amount: number
										receiver: string
										description?: string
								  }>
								| undefined,
							amount: escrowDataRaw.amount as number | undefined,
							receiver: escrowDataRaw.receiver as string | undefined,
							receiverMemo: escrowDataRaw.receiverMemo as number | undefined,
						}
					: undefined

				console.log('📦 Escrow save data (single-release):', {
					contractId,
					hasEscrowData: !!escrowData,
					escrowData,
					responseKeys: Object.keys(responseAny),
					hasEscrowInResponse: 'escrow' in responseAny,
					fullResponse: responseAny,
				})

				// Validate that we have a contract ID before proceeding
				if (!contractId) {
					console.error(
						'❌ No contract ID in transaction response:',
						responseAny,
					)
					toast.error('Escrow deployed but contract ID not found', {
						description: 'Please check the transaction result manually',
					})
					// Don't throw - allow user to see the success message but warn about missing contract ID
					return
				}

				// 3) Save escrow contract ID to database
				if (contractId) {
					// Always provide escrow data - use response data or fallback to form data
					const escrowDataToSave = escrowData
						? {
								engagementId: escrowData.engagementId || effectiveEngagementId,
								title: escrowData.title || title.trim(),
								description: escrowData.description || description.trim(),
								roles: {
									approver: escrowData.roles?.approver || approver.trim(),
									serviceProvider:
										escrowData.roles?.serviceProvider || serviceProvider.trim(),
									disputeResolver:
										escrowData.roles?.disputeResolver || disputeResolver.trim(),
									platformAddress:
										escrowData.roles?.platformAddress || platformAddress.trim(),
									releaseSigner:
										escrowData.roles?.releaseSigner || releaseSigner.trim(),
								},
								platformFee: escrowData.platformFee || (platformFee as number),
								milestones:
									escrowData.milestones?.map(
										(m: {
											amount: number
											receiver: string
											description?: string
										}) => ({
											amount: m.amount,
											receiver: m.receiver,
										}),
									) || undefined,
								amount: 'amount' in escrowData ? escrowData.amount : undefined,
								receiver:
									'receiver' in escrowData ? escrowData.receiver : undefined,
								receiverMemo:
									'receiverMemo' in escrowData
										? escrowData.receiverMemo
										: undefined,
							}
						: {
								// Fallback to form data if response doesn't have escrow data (single-release)
								engagementId: effectiveEngagementId,
								title: title.trim(),
								description: description.trim(),
								roles: {
									approver: approver.trim(),
									serviceProvider: serviceProvider.trim(),
									disputeResolver: disputeResolver.trim(),
									platformAddress: platformAddress.trim(),
									releaseSigner: releaseSigner.trim(),
								},
								platformFee: platformFee as number,
								amount:
									typeof amount === 'number'
										? amount
										: typeof amount === 'string'
											? parseFloat(amount) || 0
											: 0,
								receiver: receiver.trim() || serviceProvider.trim(),
								receiverMemo:
									typeof receiverMemo === 'number'
										? receiverMemo
										: typeof receiverMemo === 'string'
											? Number(receiverMemo) || 0
											: 0,
							}

					console.log('💾 Saving escrow contract (single-release):', {
						contractId,
						hasEscrowDataToSave: !!escrowDataToSave,
						escrowDataToSaveKeys: escrowDataToSave
							? Object.keys(escrowDataToSave)
							: [],
						engagementId: escrowDataToSave?.engagementId,
						hasRoles: !!escrowDataToSave?.roles,
						escrowDataToSaveFull: escrowDataToSave,
					})

					// Ensure escrowDataToSave is always defined and has required fields
					if (
						!escrowDataToSave ||
						!escrowDataToSave.engagementId ||
						!escrowDataToSave.roles
					) {
						console.error(
							'❌ Invalid escrowDataToSave structure:',
							escrowDataToSave,
						)
						toast.error('Failed to prepare escrow data for saving')
						return
					}

					// Create a clean, serializable object for the server action
					// Next.js server actions need plain objects without undefined values
					// Ensure all required fields are present and not undefined
					const serializableEscrowData = {
						engagementId:
							escrowDataToSave.engagementId || effectiveEngagementId,
						title: escrowDataToSave.title || title.trim() || 'Untitled Escrow',
						description:
							escrowDataToSave.description || description.trim() || '',
						roles: {
							approver: escrowDataToSave.roles.approver || approver.trim(),
							serviceProvider:
								escrowDataToSave.roles.serviceProvider ||
								serviceProvider.trim(),
							disputeResolver:
								escrowDataToSave.roles.disputeResolver ||
								disputeResolver.trim(),
							platformAddress:
								escrowDataToSave.roles.platformAddress ||
								platformAddress.trim(),
							releaseSigner:
								escrowDataToSave.roles.releaseSigner || releaseSigner.trim(),
						},
						platformFee:
							escrowDataToSave.platformFee ?? (platformFee as number),
						...(escrowDataToSave.milestones &&
							escrowDataToSave.milestones.length > 0 && {
								milestones: escrowDataToSave.milestones.map((m) => ({
									amount: m.amount,
									receiver: m.receiver,
								})),
							}),
						...(escrowDataToSave.amount !== undefined &&
							escrowDataToSave.amount !== null && {
								amount: escrowDataToSave.amount,
							}),
						...(escrowDataToSave.receiver?.trim() && {
							receiver: escrowDataToSave.receiver,
						}),
						...(escrowDataToSave.receiverMemo !== undefined &&
							escrowDataToSave.receiverMemo !== null && {
								receiverMemo: escrowDataToSave.receiverMemo,
							}),
					}

					// Final validation before sending
					if (
						!serializableEscrowData.engagementId ||
						!serializableEscrowData.roles ||
						!serializableEscrowData.roles.approver
					) {
						console.error(
							'❌ Invalid serializableEscrowData structure:',
							serializableEscrowData,
						)
						toast.error('Failed to prepare escrow data for saving', {
							description: 'Missing required fields in escrow data',
						})
						return
					}

					console.log('📤 Sending to server action (single-release):', {
						contractId,
						hasSerializableData: !!serializableEscrowData,
						serializableKeys: Object.keys(serializableEscrowData),
						hasEngagementId: !!serializableEscrowData.engagementId,
						hasRoles: !!serializableEscrowData.roles,
						rolesKeys: serializableEscrowData.roles
							? Object.keys(serializableEscrowData.roles)
							: [],
						fullSerializableData: JSON.stringify(serializableEscrowData),
					})

					// Ensure we always pass engagementId even if escrowData is missing
					const saveResult = await saveEscrowContractAction({
						projectId,
						contractId,
						engagementId: effectiveEngagementId,
						escrowData: serializableEscrowData || undefined, // Explicitly pass undefined if null
					})

					if (!saveResult.success) {
						console.error('Failed to save escrow:', saveResult.error)
						toast.error('Escrow created but failed to save to database', {
							description: saveResult.error,
						})
						return
					}
				} else {
					// If contractId is not in deployResponse, we might need to extract it
					// from the transaction result or query it separately
					toast.warning(
						'Escrow transaction submitted, but contract ID not available yet',
					)
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

				// Validate payload before sending
				console.log('📤 Sending multi-release escrow payload:', {
					hasSigner: !!payload.signer,
					hasEngagementId: !!payload.engagementId,
					hasTitle: !!payload.title,
					hasRoles: !!payload.roles,
					hasDescription: !!payload.description,
					hasPlatformFee: typeof payload.platformFee === 'number',
					hasTrustline: !!payload.trustline,
					milestonesCount: payload.milestones.length,
					payload: JSON.stringify(payload, null, 2),
				})

				// Validate milestones have required fields
				const invalidMilestones = sanitizedMilestones.filter(
					(m) =>
						!m.amount || m.amount <= 0 || !m.receiver || !m.receiver.trim(),
				)
				if (invalidMilestones.length > 0) {
					const errorMsg =
						'Invalid milestone data: All milestones must have amount > 0 and receiver address'
					console.error('❌ Invalid milestones:', invalidMilestones)
					toast.error('Invalid milestone data', {
						description: errorMsg,
					})
					throw new Error(errorMsg)
				}

				// 1) Execute function from Trustless Work -> returns unsigned XDR
				let deployResponse: EscrowRequestResponse
				try {
					deployResponse = await deployEscrow(payload, 'multi-release')
				} catch (error) {
					console.error('❌ deployEscrow error:', error)
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to create escrow: API request failed'
					toast.error('Failed to deploy escrow', {
						description: errorMessage,
					})
					throw new Error(errorMessage)
				}

				if (!deployResponse || deployResponse.status !== 'SUCCESS') {
					const errorMsg =
						'Escrow deployment failed: Invalid request or API error'
					console.error('❌ deployEscrow failed:', {
						status: deployResponse?.status,
						response: deployResponse,
					})
					toast.error('Failed to deploy escrow', {
						description: errorMsg,
					})
					throw new Error(errorMsg)
				}

				if (!deployResponse.unsignedTransaction) {
					console.error(
						'❌ No unsigned transaction in response:',
						deployResponse,
					)
					toast.error('Failed to deploy escrow', {
						description: 'No unsigned transaction returned from API',
					})
					throw new Error('No unsigned transaction returned')
				}

				// 2) Sign transaction with Stellar Wallets Kit
				let signedXdr: string
				try {
					signedXdr = await signTransaction(deployResponse.unsignedTransaction)
				} catch (error) {
					console.error('❌ signTransaction error:', error)
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to sign transaction'
					toast.error('Failed to sign transaction', {
						description: errorMessage,
					})
					throw new Error(errorMessage)
				}

				// 3) Send signed transaction
				let sendResult:
					| InitializeSingleReleaseEscrowResponse
					| InitializeMultiReleaseEscrowResponse
					| { status: string }
				try {
					sendResult = await sendTransaction(signedXdr)
				} catch (error) {
					console.error('❌ sendTransaction error:', error)
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to send transaction'
					toast.error('Failed to send transaction', {
						description: errorMessage,
					})
					throw new Error(errorMessage)
				}

				if (
					!sendResult ||
					(sendResult as { status?: string }).status !== 'SUCCESS'
				) {
					const status = (sendResult as { status?: string })?.status
					const errorMsg =
						status === 'ERROR'
							? 'Transaction submission failed'
							: 'Transaction failed: Invalid response'
					console.error('❌ sendTransaction failed:', {
						status,
						response: sendResult,
					})
					toast.error('Transaction failed', {
						description: errorMsg,
					})
					throw new Error(errorMsg)
				}

				// Get contract ID and escrow data from response
				// Use Record type to safely access properties
				const responseAny = sendResult as Record<string, unknown>
				const contractId =
					(responseAny.contractId as string | undefined) ||
					(responseAny.contract_id as string | undefined) ||
					undefined

				// Extract escrow data - the response has an 'escrow' property
				const escrowDataRaw = responseAny.escrow as
					| Record<string, unknown>
					| undefined
				const escrowData = escrowDataRaw
					? {
							engagementId: escrowDataRaw.engagementId as string | undefined,
							title: escrowDataRaw.title as string | undefined,
							description: escrowDataRaw.description as string | undefined,
							roles: escrowDataRaw.roles as
								| {
										approver?: string
										serviceProvider?: string
										disputeResolver?: string
										platformAddress?: string
										releaseSigner?: string
								  }
								| undefined,
							platformFee: escrowDataRaw.platformFee as number | undefined,
							milestones: escrowDataRaw.milestones as
								| Array<{
										amount: number
										receiver: string
										description?: string
								  }>
								| undefined,
							amount: escrowDataRaw.amount as number | undefined,
							receiver: escrowDataRaw.receiver as string | undefined,
							receiverMemo: escrowDataRaw.receiverMemo as number | undefined,
						}
					: undefined

				console.log('📦 Escrow save data (multi-release):', {
					contractId,
					hasEscrowData: !!escrowData,
					escrowData,
					responseKeys: Object.keys(responseAny),
					hasEscrowInResponse: 'escrow' in responseAny,
					fullResponse: responseAny,
				})

				// Validate that we have a contract ID before proceeding
				if (!contractId) {
					console.error(
						'❌ No contract ID in transaction response:',
						responseAny,
					)
					toast.error('Escrow deployed but contract ID not found', {
						description: 'Please check the transaction result manually',
					})
					// Don't throw - allow user to see the success message but warn about missing contract ID
					return
				}

				// 4) Save escrow contract ID to database
				if (contractId) {
					// Always provide escrow data - use response data or fallback to form data
					const escrowDataToSave = escrowData
						? {
								engagementId: escrowData.engagementId || effectiveEngagementId,
								title: escrowData.title || title.trim(),
								description: escrowData.description || description.trim(),
								roles: {
									approver: escrowData.roles?.approver || approver.trim(),
									serviceProvider:
										escrowData.roles?.serviceProvider || serviceProvider.trim(),
									disputeResolver:
										escrowData.roles?.disputeResolver || disputeResolver.trim(),
									platformAddress:
										escrowData.roles?.platformAddress || platformAddress.trim(),
									releaseSigner:
										escrowData.roles?.releaseSigner || releaseSigner.trim(),
								},
								platformFee: escrowData.platformFee || (platformFee as number),
								milestones:
									escrowData.milestones?.map(
										(m: {
											amount: number
											receiver: string
											description?: string
										}) => ({
											amount: m.amount,
											receiver: m.receiver,
										}),
									) || undefined,
								amount: 'amount' in escrowData ? escrowData.amount : undefined,
								receiver:
									'receiver' in escrowData ? escrowData.receiver : undefined,
								receiverMemo:
									'receiverMemo' in escrowData
										? escrowData.receiverMemo
										: undefined,
							}
						: {
								// Fallback to form data if response doesn't have escrow data
								engagementId: effectiveEngagementId,
								title: title.trim(),
								description: description.trim(),
								roles: {
									approver: approver.trim(),
									serviceProvider: serviceProvider.trim(),
									disputeResolver: disputeResolver.trim(),
									platformAddress: platformAddress.trim(),
									releaseSigner: releaseSigner.trim(),
								},
								platformFee: platformFee as number,
								milestones: milestones
									.filter((m) => m.description.trim().length > 0)
									.map((m) => {
										if ('amount' in m && 'receiver' in m) {
											return {
												amount: m.amount as number,
												receiver: m.receiver.trim(),
											}
										}
										return null
									})
									.filter(
										(m): m is { amount: number; receiver: string } =>
											m !== null,
									),
							}

					console.log('💾 Saving escrow contract (multi-release):', {
						contractId,
						hasEscrowDataToSave: !!escrowDataToSave,
						escrowDataToSaveKeys: escrowDataToSave
							? Object.keys(escrowDataToSave)
							: [],
						engagementId: escrowDataToSave?.engagementId,
						hasRoles: !!escrowDataToSave?.roles,
						hasMilestones: !!escrowDataToSave?.milestones,
						milestonesCount: escrowDataToSave?.milestones?.length || 0,
						escrowDataToSaveFull: escrowDataToSave,
					})

					// Ensure escrowDataToSave is always defined and has required fields
					if (
						!escrowDataToSave ||
						!escrowDataToSave.engagementId ||
						!escrowDataToSave.roles
					) {
						console.error(
							'❌ Invalid escrowDataToSave structure:',
							escrowDataToSave,
						)
						toast.error('Failed to prepare escrow data for saving')
						return
					}

					// Create a clean, serializable object for the server action
					// Next.js server actions need plain objects without undefined values
					// Ensure all required fields are present and not undefined
					const serializableEscrowData = {
						engagementId:
							escrowDataToSave.engagementId || effectiveEngagementId,
						title: escrowDataToSave.title || title.trim() || 'Untitled Escrow',
						description:
							escrowDataToSave.description || description.trim() || '',
						roles: {
							approver: escrowDataToSave.roles.approver || approver.trim(),
							serviceProvider:
								escrowDataToSave.roles.serviceProvider ||
								serviceProvider.trim(),
							disputeResolver:
								escrowDataToSave.roles.disputeResolver ||
								disputeResolver.trim(),
							platformAddress:
								escrowDataToSave.roles.platformAddress ||
								platformAddress.trim(),
							releaseSigner:
								escrowDataToSave.roles.releaseSigner || releaseSigner.trim(),
						},
						platformFee:
							escrowDataToSave.platformFee ?? (platformFee as number),
						...(escrowDataToSave.milestones &&
							escrowDataToSave.milestones.length > 0 && {
								milestones: escrowDataToSave.milestones.map((m) => ({
									amount: m.amount,
									receiver: m.receiver,
								})),
							}),
						...(escrowDataToSave.amount !== undefined &&
							escrowDataToSave.amount !== null && {
								amount: escrowDataToSave.amount,
							}),
						...(escrowDataToSave.receiver?.trim() && {
							receiver: escrowDataToSave.receiver,
						}),
						...(escrowDataToSave.receiverMemo !== undefined &&
							escrowDataToSave.receiverMemo !== null && {
								receiverMemo: escrowDataToSave.receiverMemo,
							}),
					}

					// Final validation before sending
					if (
						!serializableEscrowData.engagementId ||
						!serializableEscrowData.roles ||
						!serializableEscrowData.roles.approver
					) {
						console.error(
							'❌ Invalid serializableEscrowData structure:',
							serializableEscrowData,
						)
						toast.error('Failed to prepare escrow data for saving', {
							description: 'Missing required fields in escrow data',
						})
						return
					}

					console.log('📤 Sending to server action (multi-release):', {
						contractId,
						hasSerializableData: !!serializableEscrowData,
						serializableKeys: Object.keys(serializableEscrowData),
						hasEngagementId: !!serializableEscrowData.engagementId,
						hasRoles: !!serializableEscrowData.roles,
						rolesKeys: serializableEscrowData.roles
							? Object.keys(serializableEscrowData.roles)
							: [],
						fullSerializableData: JSON.stringify(serializableEscrowData),
					})

					// Ensure we always pass engagementId even if escrowData is missing
					const saveResult = await saveEscrowContractAction({
						projectId,
						contractId,
						engagementId: effectiveEngagementId,
						escrowData: serializableEscrowData || undefined, // Explicitly pass undefined if null
					})

					if (!saveResult.success) {
						console.error('Failed to save escrow:', saveResult.error)
						toast.error('Escrow created but failed to save to database', {
							description: saveResult.error,
						})
						return
					}
				} else {
					// If contractId is not in sendResult, we might need to extract it
					// from the transaction result or query it separately
					toast.warning(
						'Escrow transaction submitted, but contract ID not available yet',
					)
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
			if (!isConnected) {
				await connect()
			}
			if (!address) {
				toast.error('Please connect a Stellar wallet to continue')
				return
			}
			const res = await approveMilestone(
				{
					contractId: escrowContractAddress,
					milestoneIndex,
					approver: address,
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
			if (!isConnected) {
				await connect()
			}
			if (!address) {
				toast.error('Please connect a Stellar wallet to continue')
				return
			}
			const res = await changeMilestoneStatus(
				{
					contractId: escrowContractAddress,
					milestoneIndex,
					newStatus: 'approved',
					newEvidence: 'Updated via admin panel',
					serviceProvider: address,
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
													// eslint-disable-next-line @typescript-eslint/no-unused-vars
													const {
														amount: _amount,
														receiver: _receiver,
														...rest
													} = m
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
											The asset contract address for the trustline. For USDC
											testnet (Soroban-wrapped), use:
											CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
										</TooltipContent>
									</Tooltip>
								</div>
								<Input
									id={trustlineAddressId}
									value={trustlineAddress}
									onChange={(e) => setTrustlineAddress(e.target.value)}
									placeholder="Asset contract address (e.g., USDC Soroban contract)"
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
																placeholder="Enter Stellar address (must have USDC trustline)"
															/>
															<p className="text-xs text-muted-foreground mt-1">
																⚠️ The receiver address must have a USDC
																trustline established. Use a Stellar account
																address (G-address) with an active USDC
																trustline.
															</p>
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
