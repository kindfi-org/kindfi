'use client'

import { useCallback, useState } from 'react'
import type { KycDenialPayload } from '~/lib/kyc/client'
import { parseKycDenialResponse, requestKycAuthorization } from '~/lib/kyc/client'
import type { KycFinancialAction } from '~/lib/kyc/types'

export const useKycRequiredGate = (userId: string) => {
	const [denial, setDenial] = useState<KycDenialPayload | null>(null)
	const [open, setOpen] = useState(false)

	const showDenial = useCallback((payload: KycDenialPayload) => {
		setDenial(payload)
		setOpen(true)
	}, [])

	const handleDeniedResponse = useCallback(
		async (response: Response) => {
			const payload = await parseKycDenialResponse(response)
			if (!payload) return false
			showDenial(payload)
			return true
		},
		[showDenial],
	)

	const preflight = useCallback(
		async (action: KycFinancialAction, extra?: { amount?: number; asset?: string }) => {
			if (!userId) return true
			const result = await requestKycAuthorization({ action, ...extra })
			if (result.allowed) return true
			showDenial(result.denial)
			return false
		},
		[showDenial, userId],
	)

	return {
		open,
		setOpen,
		denial,
		userId,
		showDenial,
		handleDeniedResponse,
		preflight,
	}
}
