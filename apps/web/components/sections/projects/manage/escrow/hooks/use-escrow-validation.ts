import { useMemo } from 'react'
import type { EscrowFormData } from '../types'

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
	}, [formData, projectId])
}
