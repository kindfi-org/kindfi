'use client'

import { useCallback, useState } from 'react'
import type { KycDenialPayload } from '~/lib/kyc/client'
import { parseKycDenialResponse, requestKycAuthorization } from '~/lib/kyc/client'
import type { KycFinancialAction } from '~/lib/kyc/types'

/**
 * KYC gate hook.
 *
 * `userId` is the resolved authenticated principal. `null` means "the principal is
 * not resolved yet": callers must not fire a gated request while
 * `isPrincipalResolved` is `false`, and must not treat `null` as "the gate is
 * disabled". Callers that can only hold a string are unaffected - the type
 * parameter keeps their `userId` a plain `string`.
 */
export const useKycRequiredGate = <UserId extends string | null>(userId: UserId) => {
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
		/** `false` only when the principal is unresolved (`null`), never for an empty string. */
		isPrincipalResolved: userId !== null,
		showDenial,
		handleDeniedResponse,
		preflight,
	}
}
