import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import type {
	CreateOptionPayload,
	CreateRoundPayload,
} from '~/lib/governance/types'
import { GovernanceContractService } from '~/lib/stellar/governance-contract'

/**
 * GET /api/governance/rounds
 *
 * Returns all governance rounds ordered by start date (newest first),
 * with their options and aggregated vote weights.
 */
export async function GET(req: NextRequest) {
	try {
		const { supabase } = await import('@packages/lib/supabase')
		const { searchParams } = new URL(req.url)
		const status = searchParams.get('status')

		// Auto-activate and close rounds based on current time
		await supabase.rpc('activate_governance_rounds')
		await supabase.rpc('close_expired_governance_rounds')

		let query = supabase
			.from('governance_rounds')
			.select(
				`
				*,
				options:governance_options!governance_options_round_id_fkey(*)
			`,
			)
			.order('starts_at', { ascending: false })

		if (status) {
			query = query.eq('status', status)
		}

		const { data: rounds, error } = await query

		if (error) {
			console.error('Error fetching governance rounds:', error)
			return NextResponse.json(
				{ error: 'Failed to fetch rounds' },
				{ status: 500 },
			)
		}

		// For each round, fetch aggregated vote weights per option
		const enrichedRounds = await Promise.all(
			(rounds ?? []).map(async (round) => {
				const { data: votes } = await supabase
					.from('governance_votes')
					.select('option_id, vote_type, vote_weight')
					.eq('round_id', round.id)

				const weightMap: Record<string, { up: number; down: number }> = {}
				for (const v of votes ?? []) {
					if (!weightMap[v.option_id]) {
						weightMap[v.option_id] = { up: 0, down: 0 }
					}
					if (v.vote_type === 'up') {
						weightMap[v.option_id].up += v.vote_weight
					} else {
						weightMap[v.option_id].down += v.vote_weight
					}
				}

				const enrichedOptions = (round.options ?? []).map(
					(opt: { id: string }) => ({
						...opt,
						weighted_upvotes: weightMap[opt.id]?.up ?? 0,
						weighted_downvotes: weightMap[opt.id]?.down ?? 0,
					}),
				)

				return { ...round, options: enrichedOptions }
			}),
		)

		return NextResponse.json({ success: true, data: enrichedRounds })
	} catch (error) {
		console.error('Error in GET /api/governance/rounds:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

/**
 * POST /api/governance/rounds
 *
 * Admin-only: creates a new governance round optionally with initial options.
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { supabase } = await import('@packages/lib/supabase')

		// Verify admin role
		const { data: profile } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', session.user.id)
			.single()

		if (profile?.role !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const body = (await req.json()) as {
			round: CreateRoundPayload
			options?: Omit<CreateOptionPayload, 'roundId'>[]
		}

		const { round: roundPayload, options: optionPayloads = [] } = body

		if (!roundPayload.title || !roundPayload.startsAt || !roundPayload.endsAt) {
			return NextResponse.json(
				{ error: 'title, startsAt, and endsAt are required' },
				{ status: 400 },
			)
		}

		const startsAt = new Date(roundPayload.startsAt)
		const endsAt = new Date(roundPayload.endsAt)
		const now = new Date()

		const status =
			endsAt < now ? 'ended' : startsAt <= now ? 'active' : 'upcoming'

		const { data: round, error: roundError } = await supabase
			.from('governance_rounds')
			.insert({
				title: roundPayload.title,
				description: roundPayload.description ?? null,
				starts_at: roundPayload.startsAt,
				ends_at: roundPayload.endsAt,
				total_fund_amount: roundPayload.totalFundAmount ?? 0,
				fund_currency: roundPayload.fundCurrency ?? 'XLM',
				status,
				created_by: session.user.id,
			})
			.select()
			.single()

		if (roundError || !round) {
			console.error('Error creating governance round:', roundError)
			return NextResponse.json(
				{ error: 'Failed to create round' },
				{ status: 500 },
			)
		}

		// Insert options if provided
		const insertedOptions: { id: string; title: string }[] = []
		if (optionPayloads.length > 0) {
			const { data: opts, error: optError } = await supabase
				.from('governance_options')
				.insert(
					optionPayloads.map((o) => ({
						round_id: round.id,
						title: o.title,
						description: o.description ?? null,
						project_slug: o.projectSlug ?? null,
						image_url: o.imageUrl ?? null,
					})),
				)
				.select('id, title')
			if (optError) {
				console.error('Error inserting options:', optError)
			} else {
				insertedOptions.push(...(opts ?? []))
			}
		}

		// ── On-chain recording (synchronous) ─────────────────────────────────────
		// Awaited so the response tells the caller exactly what landed on-chain.
		// The backend service account (SOROBAN_PRIVATE_KEY) holds the admin role.
		let contractRoundId: number | null = null
		try {
			const contract = new GovernanceContractService()

			const roundResult = await contract.createRound({
				title: round.title,
				startsAt: round.starts_at,
				endsAt: round.ends_at,
				fundAmount: round.total_fund_amount ?? 0,
			})

			if (!roundResult.success || roundResult.roundId === undefined) {
				console.warn('[Governance] create_round failed:', roundResult.error)
			} else {
				contractRoundId = roundResult.roundId

				await supabase
					.from('governance_rounds')
					.update({ contract_round_id: contractRoundId })
					.eq('id', round.id)

				for (const opt of insertedOptions) {
					const optResult = await contract.addOption({
						roundId: contractRoundId,
						title: opt.title,
					})
					if (optResult.success && optResult.optionId !== undefined) {
						await supabase
							.from('governance_options')
							.update({ contract_option_id: optResult.optionId })
							.eq('id', opt.id)
					} else {
						console.warn('[Governance] add_option failed:', optResult.error)
					}
				}

				console.info(`[Governance] Round ${round.id} → on-chain #${contractRoundId}`)
			}
		} catch (err) {
			console.error('[Governance] on-chain recording error:', err)
		}

		return NextResponse.json({
			success: true,
			data: { ...round, contract_round_id: contractRoundId },
			onChain: contractRoundId !== null,
		}, { status: 201 })
	} catch (error) {
		console.error('Error in POST /api/governance/rounds:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
