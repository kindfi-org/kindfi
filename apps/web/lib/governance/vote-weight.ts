import type { NftTier } from './types'

export const TIER_VOTE_WEIGHTS: Record<NftTier, number> = {
	bronze: 1,
	silver: 3,
	gold: 5,
	diamond: 10,
}

export const TIER_LABELS: Record<NftTier, string> = {
	bronze: 'Bronze',
	silver: 'Silver',
	gold: 'Gold',
	diamond: 'Diamond',
}

export const TIER_COLORS: Record<NftTier, string> = {
	bronze: 'bg-orange-100 text-orange-700 border-orange-300',
	silver: 'bg-gray-100 text-gray-700 border-gray-300',
	gold: 'bg-yellow-100 text-yellow-700 border-yellow-300',
	diamond: 'bg-cyan-100 text-cyan-700 border-cyan-300',
}

export const TIER_ACCENT: Record<NftTier, string> = {
	bronze: '#CD7F32',
	silver: '#C0C0C0',
	gold: '#FFD700',
	diamond: '#B9F2FF',
}

export const TIER_ORDER: NftTier[] = ['bronze', 'silver', 'gold', 'diamond']

export const getVoteWeight = (tier: NftTier): number => TIER_VOTE_WEIGHTS[tier] ?? 1

export const getTierLabel = (tier: NftTier): string => TIER_LABELS[tier] ?? tier

/**
 * Aggregates vote weights per option from a flat list of vote rows.
 * Returns a map of option_id → { up, down } totals.
 */
export function buildOptionWeightMap(
	votes: { option_id: string; vote_type: string; vote_weight: number }[],
): Record<string, { up: number; down: number }> {
	const map: Record<string, { up: number; down: number }> = {}
	for (const v of votes) {
		if (!map[v.option_id]) map[v.option_id] = { up: 0, down: 0 }
		if (v.vote_type === 'up') map[v.option_id].up += v.vote_weight
		else map[v.option_id].down += v.vote_weight
	}
	return map
}

/**
 * Given a list of options and the current user's vote,
 * calculate the projected fund allocation percentage per option.
 */
export const calcAllocationPercents = (
	options: { id: string; weighted_upvotes?: number }[],
): Record<string, number> => {
	const totalUp = options.reduce((sum, o) => sum + (o.weighted_upvotes ?? 0), 0)
	if (totalUp === 0) return Object.fromEntries(options.map((o) => [o.id, 0]))
	return Object.fromEntries(
		options.map((o) => [o.id, Math.round(((o.weighted_upvotes ?? 0) / totalUp) * 100)]),
	)
}
