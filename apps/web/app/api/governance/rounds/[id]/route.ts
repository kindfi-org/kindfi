import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { buildOptionWeightMap } from '~/lib/governance/vote-weight'
import { governanceRoundIdParamSchema } from '~/lib/schemas/governance.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * GET /api/governance/rounds/[id]
 *
 * Returns a single governance round with options, aggregated vote weights,
 * and the current user's vote (if authenticated).
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const [{ id }, session, { supabase }] = await Promise.all([
			params,
			getServerSession(nextAuthOption),
			import('@packages/lib/supabase'),
		])
		const validation = validateRequest(governanceRoundIdParamSchema, { id })
		if (!validation.success) return validation.response
		const { id: validatedId } = validation.data

		await Promise.all([
			supabase.rpc('activate_governance_rounds'),
			supabase.rpc('close_expired_governance_rounds'),
		])

		const [{ data: round, error }, { data: votes }] = await Promise.all([
			supabase
				.from('governance_rounds')
				.select(`*, options:governance_options!governance_options_round_id_fkey(*)`)
				.eq('id', validatedId)
				.single(),
			supabase
				.from('governance_votes')
				.select('option_id, vote_type, vote_weight, user_id')
				.eq('round_id', validatedId),
		])

		if (error || !round) {
			return NextResponse.json({ error: 'Round not found' }, { status: 404 })
		}

		const weightMap = buildOptionWeightMap(votes ?? [])
		let userVote: { option_id: string; vote_type: string } | null = null
		if (session?.user?.id) {
			const uv = (votes ?? []).find((v) => v.user_id === session.user.id)
			if (uv) userVote = { option_id: uv.option_id, vote_type: uv.vote_type }
		}

		const enrichedOptions = (round.options ?? []).map((opt: { id: string }) => ({
			...opt,
			weighted_upvotes: weightMap[opt.id]?.up ?? 0,
			weighted_downvotes: weightMap[opt.id]?.down ?? 0,
			user_voted: userVote?.option_id === opt.id,
			user_vote_type: userVote?.option_id === opt.id ? userVote.vote_type : undefined,
		}))

		// Attach winner option if round ended
		let winner = null
		if (round.winner_option_id) {
			winner = enrichedOptions.find((o: { id: string }) => o.id === round.winner_option_id) ?? null
		}

		return NextResponse.json({
			success: true,
			data: {
				...round,
				options: enrichedOptions,
				winner,
				user_has_voted: !!userVote,
				user_voted_option_id: userVote?.option_id ?? null,
			},
		})
	} catch (error) {
		logger.error('Error in GET /api/governance/rounds/[id]:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
