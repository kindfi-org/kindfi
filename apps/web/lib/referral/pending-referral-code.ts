const PENDING_REFERRAL_CODE_KEY = 'kindfi_pending_referral_code'

export const savePendingReferralCode = (code: string): void => {
	if (typeof window === 'undefined') return
	try {
		localStorage.setItem(PENDING_REFERRAL_CODE_KEY, normalizeStoredCode(code))
	} catch {
		// ignore storage errors
	}
}

export const getPendingReferralCode = (): string | null => {
	if (typeof window === 'undefined') return null
	try {
		return localStorage.getItem(PENDING_REFERRAL_CODE_KEY)
	} catch {
		return null
	}
}

export const clearPendingReferralCode = (): void => {
	if (typeof window === 'undefined') return
	try {
		localStorage.removeItem(PENDING_REFERRAL_CODE_KEY)
	} catch {
		// ignore storage errors
	}
}

const normalizeStoredCode = (code: string): string => code.trim().toUpperCase()
