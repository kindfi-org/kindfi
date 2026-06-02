import type { NFTAttribute, UserStats } from '../types'

export function findAttr(attrs: NFTAttribute[], traitType: string): string | undefined {
	return attrs.find((a) => a.trait_type === traitType)?.value
}

const DONATION_COUNT_TRAIT_TYPES = ['Donation Count', 'Total Donations'] as const

/** Read donation count from on-chain NFT metadata (supports legacy trait names). */
export function findDonationCountAttr(attrs: NFTAttribute[]): string | undefined {
	for (const traitType of DONATION_COUNT_TRAIT_TYPES) {
		const value = findAttr(attrs, traitType)
		if (value !== undefined && value !== '') return value
	}
	return undefined
}

/**
 * Prefer live DB stats when chain metadata is missing or zero (NFT may be stale until evolve).
 */
export function resolveDonationCount(
	attrs: NFTAttribute[],
	userStats: UserStats | null | undefined,
): string {
	const fromDb = userStats?.donationCount
	if (fromDb !== undefined && fromDb > 0) {
		return String(fromDb)
	}

	const fromChain = findDonationCountAttr(attrs)
	if (fromChain !== undefined && fromChain !== '' && fromChain !== '0') {
		return fromChain
	}

	if (fromDb !== undefined) return String(fromDb)
	return fromChain ?? '0'
}

export function AttrChip({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-muted/60 rounded px-2 py-1.5 text-xs">
			<span className="text-muted-foreground">{label}:</span>{' '}
			<span className="font-medium">{value}</span>
		</div>
	)
}

export function StatBadge({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-muted/60 rounded-lg p-3 text-center">
			<p className="text-lg font-bold">{value}</p>
			<p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
		</div>
	)
}
