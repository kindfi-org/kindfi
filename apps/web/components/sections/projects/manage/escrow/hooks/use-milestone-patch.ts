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
	type NewRelease,
} from '~/lib/utils/escrow/build-update-escrow-payload'
import { isSingleReleaseMilestone } from '~/lib/utils/escrow/milestone-utils'
import { resolveValidatedEscrowData } from '~/lib/utils/escrow/resolve-validated-escrow-data'
import { getTrustlessWorkApiErrorMessage } from '~/lib/utils/escrow/trustless-work-api-error'
import type { ReleaseFormValues } from '../components/add-release-dialog'

interface UseMilestonePatchParams {
	escrowContractAddress: string
	escrowType: EscrowType
	onSuccess: () => void
	onPatchMilestone?: (
		index: number,
		patch: { kind: 'approve' } | { kind: 'status'; status: string; evidence?: string },
	) => void
}

export const useMilestonePatch = ({
	escrowContractAddress,
	escrowType,
	onSuccess,
	onPatchMilestone,
}: UseMilestonePatchParams) => {
	const {
		approveMilestone,
		changeMilestoneStatus,
		sendTransaction,
		updateEscrow,
		getEscrowByContractIds,
	} = useEscrow()
	const { ensureTrustlessSigner, signTrustlessTransaction } = useTrustlessSigner()
	const [isProcessing, setIsProcessing] = useState(false)

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
		onComplete?: () => void,
	): Promise<void> => {
		const updateResponse = await updateEscrow(payload, escrowType)
		if (updateResponse.status !== 'SUCCESS' || !updateResponse.unsignedTransaction) {
			throw new Error('Failed to prepare escrow update transaction')
		}

		const signedXdr = await signTrustlessTransaction(
			updateResponse.unsignedTransaction,
			payload.signer,
		)
		const sendResult = await sendTransaction(signedXdr)
		if (sendResult?.status !== 'SUCCESS') {
			throw new Error('Transaction failed')
		}

		toast.success(successMessage)
		onComplete?.()
		onSuccess()
	}

	const handleApproveMilestone = async (selectedMilestoneIndex: string): Promise<void> => {
		try {
			setIsProcessing(true)
			const signer = await ensureTrustlessSigner()

			const approveResponse = await approveMilestone(
				{
					contractId: escrowContractAddress,
					milestoneIndex: selectedMilestoneIndex,
					approver: signer,
				},
				escrowType,
			)

			if (approveResponse.status !== 'SUCCESS' || !approveResponse.unsignedTransaction) {
				throw new Error('Failed to prepare approval transaction')
			}

			const signedXdr = await signTrustlessTransaction(approveResponse.unsignedTransaction)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Release approved successfully')
			onPatchMilestone?.(Number(selectedMilestoneIndex), { kind: 'approve' })
			onSuccess()
		} catch (error) {
			logger.error(error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to approve release'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const handleChangeMilestoneStatus = async (
		selectedMilestoneIndex: string,
		milestoneStatus: string,
		milestoneEvidence: string,
		onComplete?: () => void,
	): Promise<void> => {
		try {
			setIsProcessing(true)
			const signer = await ensureTrustlessSigner()

			const changeResponse = await changeMilestoneStatus(
				{
					contractId: escrowContractAddress,
					milestoneIndex: selectedMilestoneIndex,
					newStatus: milestoneStatus,
					newEvidence: milestoneEvidence || undefined,
					serviceProvider: signer,
				},
				escrowType,
			)

			if (changeResponse.status !== 'SUCCESS' || !changeResponse.unsignedTransaction) {
				throw new Error('Failed to prepare status change transaction')
			}

			const signedXdr = await signTrustlessTransaction(changeResponse.unsignedTransaction)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Release status updated successfully')
			const evidence = milestoneEvidence || undefined
			onComplete?.()
			onPatchMilestone?.(Number(selectedMilestoneIndex), {
				kind: 'status',
				status: milestoneStatus,
				evidence,
			})
			onSuccess()
		} catch (error) {
			logger.error(error)
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update release status'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const handleAddRelease = async (
		newRelease: NewRelease,
		onComplete?: () => void,
	): Promise<void> => {
		try {
			setIsProcessing(true)
			const [signer, validatedEscrowData] = await Promise.all([
				ensureTrustlessSigner(),
				fetchValidatedEscrowData(),
			])
			const payload = buildUpdateEscrowPayload(validatedEscrowData, escrowType, signer, newRelease)
			await submitEscrowUpdate(payload, 'Release added successfully', onComplete)
		} catch (error) {
			logger.error(error)
			const errorMessage = getTrustlessWorkApiErrorMessage(error, 'Failed to add release')
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const handleEditRelease = async (
		editingMilestoneIndex: number | null,
		editedRelease: ReleaseFormValues,
		onComplete?: () => void,
	): Promise<void> => {
		if (editingMilestoneIndex === null) {
			toast.error('Select a release to edit.')
			return
		}

		try {
			setIsProcessing(true)
			const [signer, validatedEscrowData] = await Promise.all([
				ensureTrustlessSigner(),
				fetchValidatedEscrowData(),
			])
			const payload = buildEditReleasePayload(
				validatedEscrowData,
				escrowType,
				signer,
				editingMilestoneIndex,
				editedRelease,
			)
			await submitEscrowUpdate(payload, 'Release updated successfully', onComplete)
		} catch (error) {
			logger.error(error)
			const errorMessage = getTrustlessWorkApiErrorMessage(error, 'Failed to update release')
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const getReleaseFormValues = (
		milestone: SingleReleaseMilestone | MultiReleaseMilestone,
	): ReleaseFormValues => {
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
		isProcessing,
		handleApproveMilestone,
		handleChangeMilestoneStatus,
		handleAddRelease,
		handleEditRelease,
		getReleaseFormValues,
	}
}
