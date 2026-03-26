import { useEffect } from 'react'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useEscrowForm } from '../context/escrow-form-context'

/**
 * Syncs connected wallet address into empty role fields and milestone receivers.
 * Also syncs suggested project defaults into empty text fields.
 */
export function useWalletSync({
	suggestedTitle,
	suggestedEngagementId,
	suggestedDescription,
}: {
	suggestedTitle: string
	suggestedEngagementId: string
	suggestedDescription: string
}) {
	const { address } = useWallet()
	const { formData, setField } = useEscrowForm()

	// Sync suggested values when they arrive (only if field is still empty)
	useEffect(() => {
		if (!formData.title.trim() && suggestedTitle)
			setField('title', suggestedTitle)
	}, [suggestedTitle, formData.title, setField])

	useEffect(() => {
		if (!formData.engagementId.trim() && suggestedEngagementId)
			setField('engagementId', suggestedEngagementId)
	}, [suggestedEngagementId, formData.engagementId, setField])

	useEffect(() => {
		if (!formData.description.trim() && suggestedDescription)
			setField('description', suggestedDescription)
	}, [suggestedDescription, formData.description, setField])

	// Sync wallet address into empty role fields
	useEffect(() => {
		if (!address) return
		if (!formData.approver.trim()) setField('approver', address)
		if (!formData.serviceProvider.trim()) setField('serviceProvider', address)
		if (!formData.releaseSigner.trim()) setField('releaseSigner', address)
		if (!formData.disputeResolver.trim()) setField('disputeResolver', address)
		if (!formData.platformAddress.trim()) setField('platformAddress', address)
		if (!formData.receiver.trim()) setField('receiver', address)
	}, [address, formData, setField])

	// Sync wallet address into empty multi-release milestone receivers
	useEffect(() => {
		if (!address || formData.selectedEscrowType !== 'multi-release') return
		const updated = formData.milestones.map((m) => {
			if ('receiver' in m && !m.receiver.trim()) return { ...m, receiver: address }
			return m
		})
		// Only update if something changed
		const changed = updated.some((m, i) => m !== formData.milestones[i])
		if (changed) setField('milestones', updated)
	}, [address, formData.selectedEscrowType, formData.milestones, setField])
}
