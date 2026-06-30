import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import type { NftTier } from '~/lib/governance/types'
import { getVoteWeight } from '~/lib/governance/vote-weight'
import { withRateLimit } from '~/lib/middleware/rate-limit'
import { castVoteSchema } from '~/lib/schemas/governance.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * POST /api/governance/vote
 *
 * Casts a weighted vote for a governance option.
 * Eligibility is determined by the user's Kinders NFT tier.
 * Each user may cast exactly one vote per round.
 */
async function voteHandler(req: NextRequest) {
	try {
		const [session, body] = await Promise.all([getServerSession(nextAuthOption), req.json()])
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const validation = validateRequest(castVoteSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { roundId, optionId, voteType } = validation.data

		const { supabase } = await import('@packages/lib/supabase')

		const [{ data: round, error: roundError }, { data: option, error: optionError }] =
			await Promise.all([
				supabase.from('governance_rounds').select('id, status, ends_at').eq('id', roundId).single(),
				supabase
					.from('governance_options')
					.select('id')
					.eq('id', optionId)
					.eq('round_id', roundId)
					.single(),
			])

		if (roundError || !round) {
			return NextResponse.json({ error: 'Round not found' }, { status: 404 })
		}

		if (round.status !== 'active') {
			return NextResponse.json({ error: 'Voting is not open for this round' }, { status: 422 })
		}

		if (new Date(round.ends_at) < new Date()) {
			return NextResponse.json({ error: 'This voting round has ended' }, { status: 422 })
		}

		if (optionError || !option) {
			return NextResponse.json({ error: 'Option not found in this round' }, { status: 404 })
		}

		const [{ data: existingVote }, { data: nft, error: nftError }] = await Promise.all([
			supabase
				.from('governance_votes')
				.select('id')
				.eq('round_id', roundId)
				.eq('user_id', session.user.id)
				.maybeSingle(),
			supabase
				.from('user_nfts')
				.select('tier, stellar_address')
				.eq('user_id', session.user.id)
				.single(),
		])

		if (existingVote) {
			return NextResponse.json({ error: 'You have already voted in this round' }, { status: 409 })
		}

		if (nftError || !nft) {
			return NextResponse.json(
				{
					error: 'You must hold a Kinders NFT to vote. Make your first donation to receive one!',
				},
				{ status: 403 },
			)
		}

		const tier = nft.tier as NftTier
		const voteWeight = getVoteWeight(tier)

		// 5. Record the vote
		const { error: insertError } = await supabase.from('governance_votes').insert({
			round_id: roundId,
			option_id: optionId,
			user_id: session.user.id,
			vote_type: voteType,
			vote_weight: voteWeight,
			nft_tier: tier,
			stellar_address: nft.stellar_address ?? null,
		})

		if (insertError) {
			if (insertError.code === '23505') {
				return NextResponse.json({ error: 'You have already voted in this round' }, { status: 409 })
			}
			logger.error('Error inserting vote:', insertError)
			return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
		}

		// 6. Update denormalized counts on the option
		const countField = voteType === 'up' ? 'upvotes' : 'downvotes'
		await supabase.rpc('increment_governance_option_count', {
			p_option_id: optionId,
			p_field: countField,
			p_weight: voteWeight,
		})

		// 7. Record vote on-chain (synchronous — awaits confirmation)
		let onChain = false
		const contractAddress = process.env.GOVERNANCE_CONTRACT_ADDRESS
		const stellarAddress = nft.stellar_address

		if (contractAddress && stellarAddress) {
			try {
				const { GovernanceContractService } = await import('~/lib/stellar/governance-contract')
				const govService = new GovernanceContractService()

				const [{ data: roundRecord }, { data: optionRecord }] = await Promise.all([
					supabase.from('governance_rounds').select('contract_round_id').eq('id', roundId).single(),
					supabase
						.from('governance_options')
						.select('contract_option_id')
						.eq('id', optionId)
						.single(),
				])

				const contractRoundId = roundRecord?.contract_round_id
				const contractOptionId = optionRecord?.contract_option_id

				if (contractRoundId != null && contractOptionId != null) {
					const result = await govService.recordVote({
						voterAddress: stellarAddress,
						roundId: contractRoundId,
						optionId: contractOptionId,
						voteType,
						tier,
					})
					onChain = result.success
					if (!result.success) {
						logger.warn('[governance/vote] on-chain record_vote failed:', result.error)
					}
				}
			} catch (err) {
				logger.warn('[governance/vote] on-chain record error:', err)
			}
		}

		return NextResponse.json({
			success: true,
			onChain,
			data: {
				voteWeight,
				tier,
				optionId,
				voteType,
			},
		})
	} catch (error) {
		logger.error('Error in POST /api/governance/vote:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export const POST = withRateLimit(
	{
		preset: 'strict',
		identifier: async (req) => {
			const ip = req.headers.get('x-forwarded-for')
			const session = await getServerSession(nextAuthOption)
			return session?.user?.id ?? ip ?? 'anonymous'
		},
	},
	voteHandler,
)
