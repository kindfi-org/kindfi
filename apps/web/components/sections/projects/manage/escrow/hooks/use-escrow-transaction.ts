import type {
	EscrowRequestResponse,
	InitializeMultiReleaseEscrowPayload,
	InitializeMultiReleaseEscrowResponse,
	InitializeSingleReleaseEscrowPayload,
	InitializeSingleReleaseEscrowResponse,
} from '@trustless-work/escrow'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { saveEscrowContractAction } from '~/app/actions/escrow/save-escrow-contract'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import type { EscrowFormData } from '../types'

interface UseEscrowTransactionParams {
	projectId: string
	projectSlug: string
}

export function useEscrowTransaction({
	projectId,
	projectSlug,
}: UseEscrowTransactionParams) {
	const router = useRouter()
	const { deployEscrow, sendTransaction } = useEscrow()
	const { isConnected, connect, address, signTransaction } = useWallet()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleCreateEscrow = async (formData: EscrowFormData) => {
		setIsSubmitting(true)
		try {
			if (!isConnected) await connect()
			if (!address) {
				toast.error('Please connect a Stellar wallet to continue')
				return
			}

			const signer = address
			const effectiveEngagementId = (
				formData.engagementId || `project-${projectId}`
			).trim()
			const composedDescription =
				formData.receiverMemo.trim().length > 0
					? `${formData.description.trim()}\nReceiver Memo: ${formData.receiverMemo.trim()}`
					: formData.description.trim()

			if (formData.selectedEscrowType === 'single-release') {
				await _handleSingleRelease({
					formData,
					signer,
					effectiveEngagementId,
					composedDescription,
					projectId,
					projectSlug,
					deployEscrow,
					signTransaction,
					sendTransaction,
					router,
				})
			} else {
				await _handleMultiRelease({
					formData,
					signer,
					effectiveEngagementId,
					composedDescription,
					projectId,
					projectSlug,
					deployEscrow,
					signTransaction,
					sendTransaction,
					router,
				})
			}
		} catch (e) {
			console.error(e)
			toast.error(e instanceof Error ? e.message : 'Failed to create escrow')
		} finally {
			setIsSubmitting(false)
		}
	}

	return { handleCreateEscrow, isSubmitting }
}

// ─── helpers ────────────────────────────────────────────────────────────────

interface TransactionHelperParams {
	formData: EscrowFormData
	signer: string
	effectiveEngagementId: string
	composedDescription: string
	projectId: string
	projectSlug: string
	deployEscrow: (
		payload:
			| InitializeSingleReleaseEscrowPayload
			| InitializeMultiReleaseEscrowPayload,
		type: 'single-release' | 'multi-release',
	) => Promise<EscrowRequestResponse>
	signTransaction: (xdr: string) => Promise<string>
	sendTransaction: (
		xdr: string,
	) => Promise<
		| InitializeSingleReleaseEscrowResponse
		| InitializeMultiReleaseEscrowResponse
		| { status: string }
	>
	router: ReturnType<typeof useRouter>
}

async function _deployAndSign({
	payload,
	type,
	deployEscrow,
	signTransaction,
	sendTransaction,
}: {
	payload:
		| InitializeSingleReleaseEscrowPayload
		| InitializeMultiReleaseEscrowPayload
	type: 'single-release' | 'multi-release'
	deployEscrow: TransactionHelperParams['deployEscrow']
	signTransaction: TransactionHelperParams['signTransaction']
	sendTransaction: TransactionHelperParams['sendTransaction']
}) {
	let deployResponse: EscrowRequestResponse
	try {
		deployResponse = await deployEscrow(payload, type)
	} catch (error) {
		const msg =
			error instanceof Error ? error.message : 'Failed to create escrow: API request failed'
		toast.error('Failed to deploy escrow', { description: msg })
		throw new Error(msg)
	}

	if (!deployResponse || deployResponse.status !== 'SUCCESS') {
		const msg = 'Escrow deployment failed: Invalid request or API error'
		toast.error('Failed to deploy escrow', { description: msg })
		throw new Error(msg)
	}

	if (!deployResponse.unsignedTransaction) {
		const msg = 'No unsigned transaction returned from API'
		toast.error('Failed to deploy escrow', { description: msg })
		throw new Error(msg)
	}

	let signedXdr: string
	try {
		signedXdr = await signTransaction(deployResponse.unsignedTransaction)
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Failed to sign transaction'
		toast.error('Failed to sign transaction', { description: msg })
		throw new Error(msg)
	}

	let sendResult: InitializeSingleReleaseEscrowResponse | InitializeMultiReleaseEscrowResponse | { status: string }
	try {
		sendResult = await sendTransaction(signedXdr)
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Failed to send transaction'
		toast.error('Failed to send transaction', { description: msg })
		throw new Error(msg)
	}

	if (!sendResult || (sendResult as { status?: string }).status !== 'SUCCESS') {
		const status = (sendResult as { status?: string })?.status
		const msg = status === 'ERROR' ? 'Transaction submission failed' : 'Transaction failed: Invalid response'
		toast.error('Transaction failed', { description: msg })
		throw new Error(msg)
	}

	return sendResult as Record<string, unknown>
}

function _extractContractData(responseAny: Record<string, unknown>) {
	const contractId =
		(responseAny.contractId as string | undefined) ||
		(responseAny.contract_id as string | undefined)

	const escrowDataRaw = responseAny.escrow as Record<string, unknown> | undefined
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
					| Array<{ amount: number; receiver: string; description?: string }>
					| undefined,
				amount: escrowDataRaw.amount as number | undefined,
				receiver: escrowDataRaw.receiver as string | undefined,
				receiverMemo: escrowDataRaw.receiverMemo as number | undefined,
			}
		: undefined

	return { contractId, escrowData }
}

async function _saveAndRedirect({
	contractId,
	escrowData,
	formData,
	effectiveEngagementId,
	projectId,
	projectSlug,
	router,
}: {
	contractId: string | undefined
	escrowData: ReturnType<typeof _extractContractData>['escrowData']
	formData: EscrowFormData
	effectiveEngagementId: string
	projectId: string
	projectSlug: string
	router: TransactionHelperParams['router']
}) {
	if (!contractId) {
		toast.error('Escrow deployed but contract ID not found', {
			description: 'Please check the transaction result manually',
		})
		return
	}

	const roles = {
		approver: escrowData?.roles?.approver || formData.approver.trim(),
		serviceProvider: escrowData?.roles?.serviceProvider || formData.serviceProvider.trim(),
		disputeResolver: escrowData?.roles?.disputeResolver || formData.disputeResolver.trim(),
		platformAddress: escrowData?.roles?.platformAddress || formData.platformAddress.trim(),
		releaseSigner: escrowData?.roles?.releaseSigner || formData.releaseSigner.trim(),
	}

	const serializableEscrowData = {
		engagementId: escrowData?.engagementId || effectiveEngagementId,
		title: escrowData?.title || formData.title.trim() || 'Untitled Escrow',
		description: escrowData?.description || formData.description.trim() || '',
		roles,
		platformFee: escrowData?.platformFee ?? (formData.platformFee as number),
		...(escrowData?.milestones && escrowData.milestones.length > 0
			? { milestones: escrowData.milestones.map((m) => ({ amount: m.amount, receiver: m.receiver })) }
			: formData.selectedEscrowType === 'multi-release'
				? {
						milestones: formData.milestones
							.filter((m) => m.description.trim().length > 0)
							.flatMap((m) => {
								if ('amount' in m && 'receiver' in m) {
									return [{ amount: m.amount as number, receiver: m.receiver.trim() }]
								}
								return []
							}),
					}
				: {}),
		...(formData.selectedEscrowType === 'single-release'
			? {
					amount: escrowData?.amount ?? (formData.amount as number),
					receiver: escrowData?.receiver || formData.receiver.trim(),
					...(escrowData?.receiverMemo !== undefined
						? { receiverMemo: escrowData.receiverMemo }
						: {}),
				}
			: {}),
	}

	const saveResult = await saveEscrowContractAction({
		projectId,
		contractId,
		engagementId: effectiveEngagementId,
		escrowData: serializableEscrowData,
	})

	if (!saveResult.success) {
		toast.error('Escrow created but failed to save to database', {
			description: saveResult.error,
		})
		return
	}

	toast.success('Escrow successfully created and deployed!', {
		description: 'The escrow contract has been initialized on the blockchain.',
	})

	setTimeout(() => {
		router.push(`/projects/${projectSlug}/manage`)
	}, 1500)
}

async function _handleSingleRelease({
	formData,
	signer,
	effectiveEngagementId,
	composedDescription,
	projectId,
	projectSlug,
	deployEscrow,
	signTransaction,
	sendTransaction,
	router,
}: TransactionHelperParams) {
	if (!formData.amount || (formData.amount as number) <= 0) {
		toast.error('Invalid amount', { description: 'Amount must be greater than 0' })
		throw new Error('Invalid amount')
	}

	const sanitizedMilestones = formData.milestones
		.map((m) => m.description)
		.filter((d) => d.trim().length > 0)
		.map((d) => ({ description: d.trim() }))

	const payload: InitializeSingleReleaseEscrowPayload = {
		signer,
		engagementId: effectiveEngagementId,
		title: formData.title.trim(),
		roles: {
			approver: formData.approver.trim(),
			serviceProvider: formData.serviceProvider.trim(),
			platformAddress: formData.platformAddress.trim(),
			releaseSigner: formData.releaseSigner.trim(),
			disputeResolver: formData.disputeResolver.trim(),
			receiver: formData.receiver.trim(),
		},
		description: composedDescription,
		amount: formData.amount as number,
		platformFee: formData.platformFee as number,
		trustline: { address: formData.trustlineAddress.trim(), symbol: 'USDC' },
		milestones: sanitizedMilestones,
	}

	const responseAny = await _deployAndSign({
		payload,
		type: 'single-release',
		deployEscrow,
		signTransaction,
		sendTransaction,
	})

	const { contractId, escrowData } = _extractContractData(responseAny)
	await _saveAndRedirect({
		contractId,
		escrowData,
		formData,
		effectiveEngagementId,
		projectId,
		projectSlug,
		router,
	})
}

async function _handleMultiRelease({
	formData,
	signer,
	effectiveEngagementId,
	composedDescription,
	projectId,
	projectSlug,
	deployEscrow,
	signTransaction,
	sendTransaction,
	router,
}: TransactionHelperParams) {
	const sanitizedMilestones = formData.milestones
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

	const invalidMilestones = sanitizedMilestones.filter(
		(m) => !m.amount || m.amount <= 0 || !m.receiver?.trim(),
	)
	if (invalidMilestones.length > 0) {
		toast.error('Invalid milestone data', {
			description: 'All milestones must have amount > 0 and receiver address',
		})
		throw new Error('Invalid milestone data')
	}

	const payload: InitializeMultiReleaseEscrowPayload = {
		signer,
		engagementId: effectiveEngagementId,
		title: formData.title.trim(),
		roles: {
			approver: formData.approver.trim(),
			serviceProvider: formData.serviceProvider.trim(),
			platformAddress: formData.platformAddress.trim(),
			releaseSigner: formData.releaseSigner.trim(),
			disputeResolver: formData.disputeResolver.trim(),
		},
		description: composedDescription,
		platformFee: formData.platformFee as number,
		trustline: { address: formData.trustlineAddress.trim(), symbol: 'USDC' },
		milestones: sanitizedMilestones,
	}

	const responseAny = await _deployAndSign({
		payload,
		type: 'multi-release',
		deployEscrow,
		signTransaction,
		sendTransaction,
	})

	const { contractId, escrowData } = _extractContractData(responseAny)
	await _saveAndRedirect({
		contractId,
		escrowData,
		formData,
		effectiveEngagementId,
		projectId,
		projectSlug,
		router,
	})
}
