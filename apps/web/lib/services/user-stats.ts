import type { TypedSupabaseClient } from '@packages/lib/types'

export const IMPACT_SCORE_WEIGHTS = {
	DONATIONS: 10,
	QUESTS: 25,
	STREAKS: 5,
	REFERRALS: 15,
} as const

type ContributionRow = { amount: number | string | null }

interface GetUserStatsParams {
	supabase: TypedSupabaseClient
	userId: string
}

export interface UserStats {
	impactScore: number
	totalDonations: number
	totalAmount: number
	questsCompleted: number
	streakDays: number
	referralCount: number
}

export const getUserStats = async ({
	supabase,
	userId,
}: GetUserStatsParams): Promise<UserStats> => {
	const [contributionsResult, questsResult, streaksResult, referralsResult] =
		await Promise.all([
			supabase
				.from('contributions')
				.select('amount')
				.eq('contributor_id', userId),
			supabase
				.from('user_quest_progress')
				.select('id')
				.eq('user_id', userId)
				.eq('is_completed', true),
			supabase
				.from('user_streaks')
				.select('current_streak')
				.eq('user_id', userId)
				.order('current_streak', { ascending: false })
				.limit(1),
			supabase.from('referral_records').select('id').eq('referrer_id', userId),
		])

	if (contributionsResult.error) {
		throw new Error(
			`getUserStats: failed to fetch contributions for userId=${userId} (code=${contributionsResult.error.code ?? 'unknown'}): ${contributionsResult.error.message}`,
		)
	}

	if (questsResult.error) {
		throw new Error(
			`getUserStats: failed to fetch user_quest_progress for userId=${userId} (code=${questsResult.error.code ?? 'unknown'}): ${questsResult.error.message}`,
		)
	}

	if (streaksResult.error) {
		throw new Error(
			`getUserStats: failed to fetch user_streaks for userId=${userId} (code=${streaksResult.error.code ?? 'unknown'}): ${streaksResult.error.message}`,
		)
	}

	if (referralsResult.error) {
		throw new Error(
			`getUserStats: failed to fetch referral_records for userId=${userId} (code=${referralsResult.error.code ?? 'unknown'}): ${referralsResult.error.message}`,
		)
	}

	const contributions = contributionsResult.data
	const quests = questsResult.data
	const streaks = streaksResult.data
	const referrals = referralsResult.data

	const totalDonations = contributions?.length ?? 0
	const totalAmount =
		(contributions as ContributionRow[] | null | undefined)?.reduce(
			(sum: number, c: ContributionRow) => sum + Number(c.amount ?? 0),
			0,
		) ?? 0
	const questsCompleted = quests?.length ?? 0
	const streakDays = streaks?.[0]?.current_streak ?? 0
	const referralCount = referrals?.length ?? 0

	const impactScore =
		totalDonations * IMPACT_SCORE_WEIGHTS.DONATIONS +
		questsCompleted * IMPACT_SCORE_WEIGHTS.QUESTS +
		streakDays * IMPACT_SCORE_WEIGHTS.STREAKS +
		referralCount * IMPACT_SCORE_WEIGHTS.REFERRALS

	return {
		impactScore,
		totalDonations,
		totalAmount,
		questsCompleted,
		streakDays,
		referralCount,
	}
}
