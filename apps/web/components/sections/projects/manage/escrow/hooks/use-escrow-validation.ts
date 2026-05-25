import { useMemo } from 'react'
import { isExternalStellarWalletAddress } from '~/lib/utils/escrow/trustless-signer'
import type { EscrowFormData } from '../types'

const isValidTrustlessRoleAddress = (value: string) =>
	isExternalStellarWalletAddress(value.trim())

export function useEscrowValidation(
	formData: EscrowFormData,
	projectId: string,
): boolean {
	return useMemo(() => {
		const {
			title,
			engagementId,
			trustlineAddress,
			approver,
			serviceProvider,
			releaseSigner,
			disputeResolver,
			platformAddress,
			platformFee,
			description,
			milestones,
			selectedEscrowType,
			receiver,
			amount,
		} = formData

		const baseValid =
			title.trim().length > 0 &&
			(engagementId || `project-${projectId}`).trim().length > 0 &&
			trustlineAddress.trim().length > 0 &&
			isValidTrustlessRoleAddress(approver) &&
			isValidTrustlessRoleAddress(serviceProvider) &&
			isValidTrustlessRoleAddress(releaseSigner) &&
			isValidTrustlessRoleAddress(disputeResolver) &&
			isValidTrustlessRoleAddress(platformAddress) &&
			typeof platformFee === 'number' &&
			Number.isFinite(platformFee) &&
			description.trim().length > 0 &&
			milestones.filter((m) => m.description.trim().length > 0).length > 0

		if (selectedEscrowType === 'single-release') {
			return (
				baseValid &&
				isValidTrustlessRoleAddress(receiver) &&
				typeof amount === 'number' &&
				Number.isFinite(amount)
			)
		}

		return (
			baseValid &&
			milestones.every((m) => {
				if ('amount' in m && 'receiver' in m) {
					return (
						typeof m.amount === 'number' &&
						Number.isFinite(m.amount) &&
						m.amount > 0 &&
						isValidTrustlessRoleAddress(m.receiver)
					)
				}
				return false
			})
		)
	}, [formData, projectId])
}
