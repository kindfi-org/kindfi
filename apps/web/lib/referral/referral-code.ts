/**
 * Deterministic, URL-safe referral code from a user ID.
 * Uses a simple hash plus UUID prefix for uniqueness.
 */
export const buildReferralCode = (userId: string): string => {
	let hash = 0
	for (let i = 0; i < userId.length; i++) {
		hash = (hash * 31 + userId.charCodeAt(i)) | 0
	}
	const hex = (hash >>> 0).toString(16).toUpperCase()
	const suffix = userId.replace(/-/g, '').slice(0, 4).toUpperCase()
	return `${hex}${suffix}`.slice(0, 8)
}

export const normalizeReferralCode = (code: string): string => code.trim().toUpperCase()

export const isValidReferralCodeFormat = (code: string): boolean =>
	/^[A-Z0-9]{6,12}$/.test(normalizeReferralCode(code))
