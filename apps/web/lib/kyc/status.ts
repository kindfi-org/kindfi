import type { CanonicalKycStatus, KycDbStatus, KycReasonCode, KycRequiredAction } from './types'
import { CANONICAL_KYC_STATUSES } from './types'

/**
 * Didit session statuses observed in the KindFi integration and Didit v3 API.
 * Unknown values fall through to `pending` unless they match an alias below.
 */
export const DIDIT_STATUS_ALIASES: Record<string, CanonicalKycStatus> = {
	'not started': 'not_started',
	not_started: 'not_started',
	notstarted: 'not_started',
	'in progress': 'pending',
	in_progress: 'pending',
	inprogress: 'pending',
	pending: 'pending',
	'in review': 'in_review',
	in_review: 'in_review',
	inreview: 'in_review',
	approved: 'approved',
	verified: 'approved',
	declined: 'rejected',
	rejected: 'rejected',
	denied: 'rejected',
	abandoned: 'expired',
	expired: 'expired',
	'manual review': 'manual_review',
	manual_review: 'manual_review',
	manualreview: 'manual_review',
}

export const DIDIT_TO_CANONICAL_DOCUMENTATION: Array<{
	diditStatus: string
	canonical: CanonicalKycStatus
	notes: string
}> = [
	{
		diditStatus: 'Not Started',
		canonical: 'not_started',
		notes: 'Session created; user has not begun the Didit flow.',
	},
	{
		diditStatus: 'In Progress',
		canonical: 'pending',
		notes: 'User is completing Didit verification.',
	},
	{
		diditStatus: 'In Review',
		canonical: 'in_review',
		notes: 'Didit (or a reviewer) is evaluating submitted documents.',
	},
	{
		diditStatus: 'Approved',
		canonical: 'approved',
		notes: 'Didit approved the session. Authoritative allow state.',
	},
	{
		diditStatus: 'Verified',
		canonical: 'approved',
		notes: 'Legacy/alias of Approved. KindFi stores both as canonical approved.',
	},
	{
		diditStatus: 'Declined',
		canonical: 'rejected',
		notes: 'Didit declined the session.',
	},
	{
		diditStatus: 'Rejected',
		canonical: 'rejected',
		notes: 'Alias of Declined.',
	},
	{
		diditStatus: 'Abandoned',
		canonical: 'expired',
		notes: 'User left the flow; session is no longer active.',
	},
	{
		diditStatus: 'Expired',
		canonical: 'expired',
		notes: 'Didit session timed out.',
	},
	{
		diditStatus: 'Manual Review',
		canonical: 'manual_review',
		notes: 'Escalated review; KindFi cannot auto-approve.',
	},
]

const normalizeDiditKey = (status: string): string =>
	status.trim().toLowerCase().replace(/\s+/g, ' ')

/**
 * Maps a Didit provider status (or a stored DB enum value) to the canonical
 * KindFi KYC state. Unknown values return `pending`. Callers that cannot
 * reach Didit should pass a dedicated `provider_unavailable` instead of
 * inventing a Didit status.
 */
export const toCanonicalKycStatus = (status: string | null | undefined): CanonicalKycStatus => {
	if (!status) {
		return 'not_started'
	}

	const key = normalizeDiditKey(status)
	const compact = key.replace(/[\s_-]/g, '')
	const mapped = DIDIT_STATUS_ALIASES[key] ?? DIDIT_STATUS_ALIASES[compact]
	if (mapped) {
		return mapped
	}

	if ((CANONICAL_KYC_STATUSES as readonly string[]).includes(key)) {
		return key as CanonicalKycStatus
	}

	return 'pending'
}

export const isApprovedKycStatus = (status: CanonicalKycStatus): boolean => status === 'approved'

/**
 * Persist only values allowed by `kyc_status_enum`. Canonical `approved`
 * (including Didit `Verified`) is stored as `approved` to end the
 * approved/verified split going forward. Other non-terminal states stay
 * `pending` in the existing enum.
 */
export const toKycDbStatus = (canonical: CanonicalKycStatus): KycDbStatus => {
	if (canonical === 'approved') return 'approved'
	if (canonical === 'rejected') return 'rejected'
	return 'pending'
}

export const canonicalFromDbStatus = (
	status: KycDbStatus | null | undefined,
): CanonicalKycStatus => {
	if (!status) return 'not_started'
	if (status === 'approved' || status === 'verified') return 'approved'
	if (status === 'rejected') return 'rejected'
	return 'pending'
}

export const reasonCodeForStatus = (status: CanonicalKycStatus): KycReasonCode => {
	switch (status) {
		case 'approved':
			return 'kyc_approved'
		case 'not_started':
			return 'kyc_not_started'
		case 'pending':
			return 'kyc_pending'
		case 'in_review':
			return 'kyc_in_review'
		case 'manual_review':
			return 'kyc_manual_review'
		case 'rejected':
			return 'kyc_rejected'
		case 'expired':
			return 'kyc_expired'
		case 'provider_unavailable':
			return 'kyc_provider_unavailable'
	}
}

export const requiredActionForStatus = (
	status: CanonicalKycStatus,
): KycRequiredAction | undefined => {
	switch (status) {
		case 'approved':
			return undefined
		case 'not_started':
		case 'expired':
			return 'start_kyc'
		case 'pending':
		case 'in_review':
		case 'manual_review':
		case 'provider_unavailable':
			return 'wait_for_review'
		case 'rejected':
			return 'contact_support'
	}
}

export const isActiveDiditSessionStatus = (status: CanonicalKycStatus): boolean =>
	status === 'not_started' ||
	status === 'pending' ||
	status === 'in_review' ||
	status === 'manual_review'
