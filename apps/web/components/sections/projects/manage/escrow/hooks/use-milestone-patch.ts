import type {
	EscrowType,
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import {
	buildEditReleasePayload,
	buildUpdateEscrowPayload,
	type EditRelease,
	type NewRelease,
} from '~/lib/utils/escrow/build-update-escrow-payload'
import { isSingleReleaseMilestone } from '~/lib/utils/escrow/milestone-utils'
import { resolveValidatedEscrowData } from '~/lib/utils/escrow/resolve-validated-escrow-data'
import { submitTrustlessEscrowXdr } from '~/lib/utils/escrow/trustless-submit'
import { getTrustlessWorkApiErrorMessage } from '~/lib/utils/escrow/trustless-work-api-error'

export type ProcessingOperation = 'approve' | 'status' | 'add' | 'edit' | null

interface UseMilestonePatchParams {
	escrowContractAddress: string
	escrowType: EscrowType
	onSuccess: () => void
	onPatchMilestone?: (
		index: number,
		patch: { kind: 'approve' } | { kind: 'status'; status: string; evidence?: string },
	) => void
}

interface ApproveMilestoneParams {
	milestoneIndex: string
}

interface ChangeMilestoneStatusParams {
	milestoneIndex: string
	status: string
	evidence: string
	onComplete?: () => void
}

interface AddReleaseParams {
	release: NewRelease
	onComplete?: () => void
}

interface EditReleaseParams {
	milestoneIndex: number | null
	release: EditRelease
	onComplete?: () => void
}

interface UseMilestonePatchResult {
	processingOperation: ProcessingOperation
	isProcessing: boolean
	handleApproveMilestone: (params: ApproveMilestoneParams) => Promise<void>
	handleChangeMilestoneStatus: (params: ChangeMilestoneStatusParams) => Promise<void>
	handleAddRelease: (params: AddReleaseParams) => Promise<void>
	handleEditRelease: (params: EditReleaseParams) => Promise<void>
	getReleaseFormValues: (milestone: SingleReleaseMilestone | MultiReleaseMilestone) => NewRelease
}

export const useMilestonePatch = ({
	escrowContractAddress,
	escrowType,
	onSuccess,
	onPatchMilestone,
}: UseMilestonePatchParams): UseMilestonePatchResult => {
	const {
		approveMilestone,
		changeMilestoneStatus,
		sendTransaction,
		updateEscrow,
		getEscrowByContractIds,
	} = useEscrow()
	const { ensureTrustlessSigner, signAndSubmitTrustlessTransaction } = useTrustlessSigner()
	const [processingOperation, setProcessingOperation] = useState<ProcessingOperation>(null)
	const isProcessing = processingOperation !== null

	const fetchValidatedEscrowData = async (): Promise<GetEscrowsFromIndexerResponse> => {
		const response = await getEscrowByContractIds({
			contractIds: [escrowContractAddress],
			validateOnChain: true,
		})
		return resolveValidatedEscrowData(response)
	}

	const submitEscrowUpdate = async (
		payload: ReturnType<typeof buildUpdateEscrowPayload>,
		successMessage: string,
	): Promise<void> => {
		const updateResponse = await updateEscrow(payload, escrowType)
		if (updateResponse.status !== 'SUCCESS' || !updateResponse.unsignedTransaction) {
			throw new Error('Failed to prepare escrow update transaction')
		}

		await submitTrustlessEscrowXdr(
			updateResponse.unsignedTransaction,
			signAndSubmitTrustlessTransaction,
			sendTransaction,
			payload.signer,
		)

		toast.success(successMessage)
	}

	const handleApproveMilestone = async ({
		milestoneIndex,
	}: ApproveMilestoneParams): Promise<void> => {
		setProcessingOperation('approve')
		try {
			const signer = await ensureTrustlessSigner()

			const approveResponse = await approveMilestone(
				{
					contractId: escrowContractAddress,
					milestoneIndex,
					approver: signer,
				},
				escrowType,
			)

			if (approveResponse.status !== 'SUCCESS' || !approveResponse.unsignedTransaction) {
				throw new Error('Failed to prepare approval transaction')
			}

			await submitTrustlessEscrowXdr(
				approveResponse.unsignedTransaction,
				signAndSubmitTrustlessTransaction,
				sendTransaction,
			)

			toast.success('Release approved successfully')
		} catch (error) {
			logger.error(error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to approve release'
			toast.error(errorMessage)
			return
		} finally {
			setProcessingOperation(null)
		}

		try {
			onPatchMilestone?.(Number(milestoneIndex), { kind: 'approve' })
			onSuccess()
		} catch (callbackError) {
			logger.error(callbackError)
		}
	}

	const handleChangeMilestoneStatus = async ({
		milestoneIndex,
		status,
		evidence,
		onComplete,
	}: ChangeMilestoneStatusParams): Promise<void> => {
		setProcessingOperation('status')
		try {
			const signer = await ensureTrustlessSigner()

			const changeResponse = await changeMilestoneStatus(
				{
					contractId: escrowContractAddress,
					milestoneIndex,
					newStatus: status,
					newEvidence: evidence || undefined,
					serviceProvider: signer,
				},
				escrowType,
			)

			if (changeResponse.status !== 'SUCCESS' || !changeResponse.unsignedTransaction) {
				throw new Error('Failed to prepare status change transaction')
			}

			await submitTrustlessEscrowXdr(
				changeResponse.unsignedTransaction,
				signAndSubmitTrustlessTransaction,
				sendTransaction,
			)

			toast.success('Release status updated successfully')
		} catch (error) {
			logger.error(error)
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update release status'
			toast.error(errorMessage)
			return
		} finally {
			setProcessingOperation(null)
		}

		try {
			const resolvedEvidence = evidence || undefined
			onComplete?.()
			onPatchMilestone?.(Number(milestoneIndex), {
				kind: 'status',
				status,
				evidence: resolvedEvidence,
			})
			onSuccess()
		} catch (callbackError) {
			logger.error(callbackError)
		}
	}

	const handleAddRelease = async ({ release, onComplete }: AddReleaseParams): Promise<void> => {
		setProcessingOperation('add')
		try {
			const [signer, validatedEscrowData] = await Promise.all([
				ensureTrustlessSigner(),
				fetchValidatedEscrowData(),
			])
			const payload = buildUpdateEscrowPayload(validatedEscrowData, escrowType, signer, release)
			await submitEscrowUpdate(payload, 'Release added successfully')
		} catch (error) {
			logger.error(error)
			const errorMessage = getTrustlessWorkApiErrorMessage(error, 'Failed to add release')
			toast.error(errorMessage)
			return
		} finally {
			setProcessingOperation(null)
		}

		try {
			onComplete?.()
			onSuccess()
		} catch (callbackError) {
			logger.error(callbackError)
		}
	}

	const handleEditRelease = async ({
		milestoneIndex,
		release,
		onComplete,
	}: EditReleaseParams): Promise<void> => {
		if (milestoneIndex === null) {
			toast.error('Select a release to edit.')
			return
		}

		setProcessingOperation('edit')
		try {
			const [signer, validatedEscrowData] = await Promise.all([
				ensureTrustlessSigner(),
				fetchValidatedEscrowData(),
			])
			const payload = buildEditReleasePayload(
				validatedEscrowData,
				escrowType,
				signer,
				milestoneIndex,
				release,
			)
			await submitEscrowUpdate(payload, 'Release updated successfully')
		} catch (error) {
			logger.error(error)
			const errorMessage = getTrustlessWorkApiErrorMessage(error, 'Failed to update release')
			toast.error(errorMessage)
			return
		} finally {
			setProcessingOperation(null)
		}

		try {
			onComplete?.()
			onSuccess()
		} catch (callbackError) {
			logger.error(callbackError)
		}
	}

	const getReleaseFormValues = (
		milestone: SingleReleaseMilestone | MultiReleaseMilestone,
	): NewRelease => {
		if (isSingleReleaseMilestone(milestone)) {
			return { description: milestone.description }
		}

		return {
			description: milestone.description,
			amount: milestone.amount,
			receiver: milestone.receiver,
		}
	}

	return {
		processingOperation,
		isProcessing,
		handleApproveMilestone,
		handleChangeMilestoneStatus,
		handleAddRelease,
		handleEditRelease,
		getReleaseFormValues,
	}
}
