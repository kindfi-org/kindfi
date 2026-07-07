import type { TypedSupabaseClient } from '@packages/lib/types'
import { getUserStats } from '~/lib/services/user-stats'
import type { MatchingCandidateProject } from './schemas'

type CategoryRef = { id: string; name: string; slug: string | null; color: string } | null

interface DonationHistoryEntry {
	projectTitle: string
	amount: number
	category: string | null
	region: string | null
	tags: string[]
}

export interface UserMatchingContext {
	displayName: string | null
	bio: string | null
	country: string | null
	role: string | null
	donationHistory: DonationHistoryEntry[]
	stats: {
		donationCount: number
		totalAmount: number
		questsCompleted: number
		streakDays: number
		referralCount: number
	}
	derivedPreferences: {
		topCategories: string[]
		topRegions: string[]
		topTags: string[]
	}
}

const countTopValues = (values: string[], limit = 3): string[] => {
	const counts = new Map<string, number>()
	for (const value of values) {
		if (!value) continue
		counts.set(value, (counts.get(value) ?? 0) + 1)
	}
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([value]) => value)
}

const normalizeCategory = (category: unknown): CategoryRef => {
	if (!category || typeof category !== 'object') return null
	const row = category as { id?: string; name?: string; slug?: string | null; color?: string }
	if (!row.name || !row.id) return null
	return {
		id: row.id,
		name: row.name,
		slug: row.slug ?? null,
		color: row.color ?? '#64748b',
	}
}

export async function buildUserMatchingContext(
	supabase: TypedSupabaseClient,
	userId: string,
): Promise<UserMatchingContext> {
	const [profileResult, contributionsResult, stats] = await Promise.all([
		supabase.from('profiles').select('display_name, bio, country, role').eq('id', userId).single(),
		supabase
			.from('contributions')
			.select(
				`
				amount,
				project:project_id (
					title,
					project_location,
					category:category_id ( id, name, slug, color ),
					project_tag_relationships (
						tag:tag_id ( name )
					)
				)
			`,
			)
			.eq('contributor_id', userId)
			.order('created_at', { ascending: false })
			.limit(25),
		getUserStats({ supabase, userId }),
	])

	if (profileResult.error) {
		throw new Error(`Failed to load profile: ${profileResult.error.message}`)
	}
	if (contributionsResult.error) {
		throw new Error(`Failed to load contributions: ${contributionsResult.error.message}`)
	}

	const donationHistory: DonationHistoryEntry[] = []
	const categoryValues: string[] = []
	const regionValues: string[] = []
	const tagValues: string[] = []

	for (const contribution of contributionsResult.data ?? []) {
		const project = contribution.project as unknown as {
			title?: string
			project_location?: string
			category?: unknown
			project_tag_relationships?: Array<{ tag?: { name?: string } }>
		} | null

		if (!project?.title) continue

		const category = normalizeCategory(project.category)
		const tags =
			project.project_tag_relationships
				?.map((rel) => rel.tag?.name)
				.filter((name): name is string => Boolean(name)) ?? []

		if (category?.name) categoryValues.push(category.name)
		if (project.project_location) regionValues.push(project.project_location)
		tagValues.push(...tags)

		donationHistory.push({
			projectTitle: project.title,
			amount: Number(contribution.amount ?? 0),
			category: category?.name ?? null,
			region: project.project_location ?? null,
			tags,
		})
	}

	return {
		displayName: profileResult.data.display_name,
		bio: profileResult.data.bio,
		country: profileResult.data.country,
		role: profileResult.data.role,
		donationHistory,
		stats: {
			donationCount: stats.donationCount,
			totalAmount: stats.totalAmount,
			questsCompleted: stats.questsCompleted,
			streakDays: stats.streakDays,
			referralCount: stats.referralCount,
		},
		derivedPreferences: {
			topCategories: countTopValues(categoryValues),
			topRegions: countTopValues(regionValues),
			topTags: countTopValues(tagValues),
		},
	}
}

export async function fetchMatchingCandidates(
	supabase: TypedSupabaseClient,
	userId: string,
	limit = 50,
): Promise<MatchingCandidateProject[]> {
	const { data: contributedRows, error: contributedError } = await supabase
		.from('contributions')
		.select('project_id')
		.eq('contributor_id', userId)

	if (contributedError) {
		throw new Error(`Failed to load contributed projects: ${contributedError.message}`)
	}

	const contributedIds = new Set(
		(contributedRows ?? []).map((row) => row.project_id).filter(Boolean) as string[],
	)

	const { data, error } = await supabase
		.from('projects')
		.select(
			`
			id,
			title,
			slug,
			description,
			image_url,
			target_amount,
			current_amount,
			kinder_count,
			percentage_complete,
			project_location,
			category:category_id ( id, name, slug, color ),
			project_tag_relationships (
				tag:tag_id ( name, color )
			)
		`,
		)
		.eq('status', 'active')
		.eq('development_only', false)
		.order('kinder_count', { ascending: false })
		.limit(limit + contributedIds.size)

	if (error) {
		throw new Error(`Failed to load candidate projects: ${error.message}`)
	}

	return (data ?? [])
		.filter((project) => !contributedIds.has(project.id))
		.slice(0, limit)
		.map((project) => ({
			id: project.id,
			slug: project.slug ?? project.id,
			title: project.title,
			description: project.description,
			projectLocation: project.project_location,
			category: normalizeCategory(project.category),
			tags:
				project.project_tag_relationships
					?.map((rel) => rel.tag)
					.filter((tag): tag is { name: string; color: string | null } => Boolean(tag?.name))
					.map((tag) => ({ name: tag.name, color: tag.color })) ?? [],
			goal: project.target_amount,
			raised: project.current_amount,
			investors: project.kinder_count,
			percentageComplete: project.percentage_complete,
			image: project.image_url,
		}))
}

export const buildMatchingPrompt = (
	userContext: UserMatchingContext,
	candidates: MatchingCandidateProject[],
): string => {
	const candidateList = candidates.map((project) => ({
		id: project.id,
		title: project.title,
		description: project.description?.slice(0, 280) ?? '',
		category: project.category?.name ?? 'Uncategorized',
		region: project.projectLocation,
		tags: project.tags.map((tag) => tag.name),
		fundingProgress: project.percentageComplete ?? 0,
		supporters: project.investors,
	}))

	return `Recommend 3 to 5 projects from the candidate list that best match this KindFi user.

## User profile
- Display name: ${userContext.displayName ?? 'Unknown'}
- Bio: ${userContext.bio ?? 'Not provided'}
- Country: ${userContext.country ?? 'Not specified'}
- Role: ${userContext.role ?? 'donor'}

## Platform activity
- Total donations: ${userContext.stats.donationCount}
- Total contributed (USD): ${userContext.stats.totalAmount}
- Quests completed: ${userContext.stats.questsCompleted}
- Streak days: ${userContext.stats.streakDays}
- Referrals: ${userContext.stats.referralCount}

## Derived preferences
- Top categories: ${userContext.derivedPreferences.topCategories.join(', ') || 'None yet'}
- Top regions: ${userContext.derivedPreferences.topRegions.join(', ') || 'None yet'}
- Top tags: ${userContext.derivedPreferences.topTags.join(', ') || 'None yet'}

## Donation history (most recent first)
${
	userContext.donationHistory.length > 0
		? userContext.donationHistory
				.map(
					(entry) =>
						`- ${entry.projectTitle}: $${entry.amount} | category: ${entry.category ?? 'n/a'} | region: ${entry.region ?? 'n/a'} | tags: ${entry.tags.join(', ') || 'none'}`,
				)
				.join('\n')
		: 'No prior donations — use profile country, bio, and diverse high-impact active campaigns.'
}

## Candidate projects (only recommend from this list)
${JSON.stringify(candidateList, null, 2)}

Rules:
- Only use project ids from the candidate list.
- Prefer alignment with past categories, regions, and tags when available.
- For cold-start users, prioritize credible campaigns with clear impact in their country or globally relevant causes.
- Do not recommend projects the user already donated to (they are excluded from candidates).
- Return 3-5 recommendations ranked by fit.`
}

export const MATCHING_SYSTEM_PROMPT = `You are KindFi's project matching engine. You help donors discover social-impact crowdfunding campaigns aligned with their values, donation patterns, and regional interests.

Respond with JSON only (handled by schema). Be specific in reasons — reference categories, regions, or past behavior when possible. Keep the summary warm and concise.`
