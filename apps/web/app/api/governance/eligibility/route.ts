import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import type { NftTier } from '~/lib/governance/types'
import { getVoteWeight } from '~/lib/governance/vote-weight'

/**
 * GET /api/governance/eligibility
 *
 * Checks whether the current user holds a Kinders NFT and returns
 * their tier + vote weight.
 */
export async function GET() {
	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id) {
			return NextResponse.json({
				eligible: false,
				tier: null,
				voteWeight: 0,
				reason: 'not_authenticated',
			})
		}

		const { supabase } = await import('@packages/lib/supabase')

		const { data: nft, error } = await supabase
			.from('user_nfts')
			.select('tier')
			.eq('user_id', session.user.id)
			.single()

		if (error && error.code !== 'PGRST116') {
			console.error('Error fetching user NFT for eligibility:', error)
		}

		if (!nft) {
			return NextResponse.json({
				eligible: false,
				tier: null,
				voteWeight: 0,
				reason: 'no_nft',
			})
		}

		const tier = nft.tier as NftTier

		return NextResponse.json({
			eligible: true,
			tier,
			voteWeight: getVoteWeight(tier),
		})
	} catch (error) {
		console.error('Error in GET /api/governance/eligibility:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
