export type NftTier = 'bronze' | 'silver' | 'gold' | 'diamond'

export type VoteType = 'up' | 'down'

export type GovernanceRoundStatus = 'upcoming' | 'active' | 'ended'

export interface GovernanceOption {
	id: string
	round_id: string
	title: string
	description: string | null
	project_slug: string | null
	image_url: string | null
	upvotes: number
	downvotes: number
	total_weight: number
	created_at: string
	updated_at: string
	/** Populated client-side: total weighted upvotes for this option */
	weighted_upvotes?: number
	/** Populated client-side: total weighted downvotes for this option */
	weighted_downvotes?: number
	/** Whether the current user has voted on this option */
	user_voted?: boolean
	/** The current user's vote type (if they voted) */
	user_vote_type?: VoteType
}

export interface GovernanceRound {
	id: string
	title: string
	description: string | null
	status: GovernanceRoundStatus
	starts_at: string
	ends_at: string
	total_fund_amount: number
	fund_currency: string
	winner_option_id: string | null
	/** On-chain round ID assigned by the Governance Soroban contract (null until recorded) */
	contract_round_id: number | null
	created_by: string | null
	created_at: string
	updated_at: string
	options?: GovernanceOption[]
	winner?: GovernanceOption | null
}

export interface GovernanceVote {
	id: string
	round_id: string
	option_id: string
	user_id: string
	vote_type: VoteType
	vote_weight: number
	nft_tier: NftTier
	stellar_address: string | null
	created_at: string
}

export interface EligibilityResult {
	eligible: boolean
	tier: NftTier | null
	voteWeight: number
	reason?: string
}

export interface CommunityFundBalance {
	address: string
	/** Balance in the escrow token's native unit (e.g. USDC, XLM) */
	balance: number
}

export interface CastVotePayload {
	roundId: string
	optionId: string
	voteType: VoteType
}

export interface CreateRoundPayload {
	title: string
	description?: string
	startsAt: string
	endsAt: string
	totalFundAmount: number
	fundCurrency?: string
}

export interface CreateOptionPayload {
	roundId: string
	title: string
	description?: string
	projectSlug?: string
	imageUrl?: string
}
