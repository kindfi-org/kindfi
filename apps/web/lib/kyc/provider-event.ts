import type { CanonicalKycStatus } from './types'

const KYC_STATUS_ORDER: Record<CanonicalKycStatus, number> = {
	not_started: 0,
	pending: 1,
	expired: 1,
	provider_unavailable: 2,
	in_review: 3,
	manual_review: 4,
	approved: 5,
	rejected: 5,
}

const getKycStatusRank = (status: CanonicalKycStatus | null | undefined): number => {
	if (!status) return -1
	return KYC_STATUS_ORDER[status] ?? -1
}

export const isStaleProviderEvent = (
	incomingIso: string | null,
	lastIso: string | null,
	incomingStatus?: CanonicalKycStatus | null,
	lastStatus?: CanonicalKycStatus | null,
): boolean => {
	if (incomingIso && lastIso) {
		const incoming = Date.parse(incomingIso)
		const last = Date.parse(lastIso)
		if (!Number.isNaN(incoming) && !Number.isNaN(last)) {
			if (incoming < last) return true
			if (incoming === last) {
				return getKycStatusRank(incomingStatus) < getKycStatusRank(lastStatus)
			}
			return false
		}
	}

	if (
		(incomingIso === null || incomingIso === undefined) &&
		(lastIso !== null && lastIso !== undefined) &&
		incomingStatus !== undefined &&
		lastStatus !== undefined
	) {
		return getKycStatusRank(incomingStatus) < getKycStatusRank(lastStatus)
	}

	if (
		incomingIso !== null &&
		incomingIso !== undefined &&
		(lastIso === null || lastIso === undefined) &&
		incomingStatus !== undefined &&
		lastStatus !== undefined
	) {
		return false
	}

	if (
		(incomingIso === null || incomingIso === undefined) &&
		(lastIso === null || lastIso === undefined) &&
		incomingStatus !== undefined &&
		lastStatus !== undefined
	) {
		return getKycStatusRank(incomingStatus) < getKycStatusRank(lastStatus)
	}

	return false
}
