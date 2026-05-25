import { useEffect } from 'react'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { isExternalStellarWalletAddress } from '~/lib/utils/escrow/trustless-signer'
import { useEscrowForm } from '../context/escrow-form-context'

/**
 * Syncs connected wallet address into empty role fields and milestone receivers.
 * Also syncs suggested project defaults into empty text fields (read from context).
 */
export function useWalletSync() {
	const { address } = useWallet()
	const { formData, setField, suggestions } = useEscrowForm()
	const { suggestedTitle, suggestedEngagementId, suggestedDescription } = suggestions

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

	// Sync external wallet (G-address) into empty role fields
	useEffect(() => {
		if (!isExternalStellarWalletAddress(address)) return
		if (!formData.approver.trim()) setField('approver', address)
		if (!formData.serviceProvider.trim()) setField('serviceProvider', address)
		if (!formData.releaseSigner.trim()) setField('releaseSigner', address)
		if (!formData.disputeResolver.trim()) setField('disputeResolver', address)
		if (!formData.platformAddress.trim()) setField('platformAddress', address)
		if (!formData.receiver.trim()) setField('receiver', address)
	}, [
		address,
		formData.approver,
		formData.serviceProvider,
		formData.releaseSigner,
		formData.disputeResolver,
		formData.platformAddress,
		formData.receiver,
		setField,
	])

	// Sync wallet address into empty multi-release milestone receivers
	const milestoneReceiversKey = formData.milestones
		.map((m) => ('receiver' in m ? m.receiver : ''))
		.join('|')

	useEffect(() => {
		if (!isExternalStellarWalletAddress(address) || formData.selectedEscrowType !== 'multi-release') return
		const updated = formData.milestones.map((m) => {
			if ('receiver' in m && !m.receiver.trim())
				return { ...m, receiver: address }
			return m
		})
		// Only update if something changed
		const changed = updated.some((m, i) => m !== formData.milestones[i])
		if (changed) setField('milestones', updated)
	}, [address, formData.selectedEscrowType, milestoneReceiversKey, setField])
}
