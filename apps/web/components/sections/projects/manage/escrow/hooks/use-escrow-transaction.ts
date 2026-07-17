import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { Logger } from '~/lib/logger'
import {
	handleMultiRelease,
	handleSingleRelease,
} from '~/lib/utils/escrow/escrow-transaction-helpers'
import type { EscrowFormData } from '../types'

const logger = new Logger()

interface UseEscrowTransactionParams {
	projectId: string
	projectSlug: string
}

export function useEscrowTransaction({ projectId, projectSlug }: UseEscrowTransactionParams) {
	const router = useRouter()
	const { deployEscrow, sendTransaction } = useEscrow()
	const { ensureTrustlessSigner, signTrustlessTransaction } = useTrustlessSigner()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleCreateEscrow = async (formData: EscrowFormData) => {
		setIsSubmitting(true)
		try {
			const signer = await ensureTrustlessSigner()
			const effectiveEngagementId = (formData.engagementId || `project-${projectId}`).trim()
			const composedDescription =
				formData.receiverMemo.trim().length > 0
					? `${formData.description.trim()}\nReceiver Memo: ${formData.receiverMemo.trim()}`
					: formData.description.trim()

			if (formData.selectedEscrowType === 'single-release') {
				await handleSingleRelease({
					formData,
					signer,
					effectiveEngagementId,
					composedDescription,
					projectId,
					projectSlug,
					deployEscrow,
					signTransaction: signTrustlessTransaction,
					sendTransaction,
					router,
				})
			} else {
				await handleMultiRelease({
					formData,
					signer,
					effectiveEngagementId,
					composedDescription,
					projectId,
					projectSlug,
					deployEscrow,
					signTransaction: signTrustlessTransaction,
					sendTransaction,
					router,
				})
			}
		} catch (e) {
			logger.error({
				eventType: 'escrow.create.error',
				error: e instanceof Error ? e.message : String(e),
			})
			toast.error(e instanceof Error ? e.message : 'Failed to create escrow')
		} finally {
			setIsSubmitting(false)
		}
	}

	return { handleCreateEscrow, isSubmitting }
}
