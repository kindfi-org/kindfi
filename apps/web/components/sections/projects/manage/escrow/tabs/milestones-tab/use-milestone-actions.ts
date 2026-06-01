'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { useState } from 'react'
import { toast } from 'sonner'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'

type UseMilestoneActionsParams = {
	escrowContractAddress: string
	escrowType: EscrowType
	onSuccess: () => void
}

export const useMilestoneActions = ({
	escrowContractAddress,
	escrowType,
	onSuccess,
}: UseMilestoneActionsParams) => {
	const { approveMilestone, changeMilestoneStatus, sendTransaction } =
		useEscrow()
	const { isConnected, connect, address, signTransaction } = useWallet()
	const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState('0')
	const [milestoneStatus, setMilestoneStatus] = useState('approved')
	const [milestoneEvidence, setMilestoneEvidence] = useState('')
	const [isProcessing, setIsProcessing] = useState(false)

	const ensureWallet = async () => {
		if (!isConnected) await connect()
		if (!address) throw new Error('Wallet address missing')
		return address
	}

	const handleApproveMilestone = async () => {
		try {
			setIsProcessing(true)
			const signer = await ensureWallet()

			const approveResponse = await approveMilestone(
				{
					contractId: escrowContractAddress,
					milestoneIndex: selectedMilestoneIndex,
					approver: signer,
				},
				escrowType,
			)

			if (
				approveResponse.status !== 'SUCCESS' ||
				!approveResponse.unsignedTransaction
			) {
				throw new Error('Failed to prepare approval transaction')
			}

			const signedXdr = await signTransaction(
				approveResponse.unsignedTransaction,
			)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Milestone approved successfully!')
			onSuccess()
		} catch (error) {
			console.error(error)
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to approve milestone'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	const handleChangeMilestoneStatus = async () => {
		try {
			setIsProcessing(true)
			const signer = await ensureWallet()

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

			if (
				changeResponse.status !== 'SUCCESS' ||
				!changeResponse.unsignedTransaction
			) {
				throw new Error('Failed to prepare status change transaction')
			}

			const signedXdr = await signTransaction(
				changeResponse.unsignedTransaction,
			)
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			toast.success('Milestone status updated successfully!')
			setMilestoneEvidence('')
			onSuccess()
		} catch (error) {
			console.error(error)
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to update milestone status'
			toast.error(errorMessage)
		} finally {
			setIsProcessing(false)
		}
	}

	return {
		selectedMilestoneIndex,
		setSelectedMilestoneIndex,
		milestoneStatus,
		setMilestoneStatus,
		milestoneEvidence,
		setMilestoneEvidence,
		isProcessing,
		handleApproveMilestone,
		handleChangeMilestoneStatus,
	}
}
