import { gateway, generateObject } from 'ai'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import type { UserMatchingContext } from '~/lib/services/project-matching/build-matching-context'
import {
	buildMatchingPrompt,
	buildUserMatchingContext,
	fetchMatchingCandidates,
	MATCHING_SYSTEM_PROMPT,
	preRankCandidates,
} from '~/lib/services/project-matching/build-matching-context'
import {
	type MatchingCandidateProject,
	matchingAiResponseSchema,
	type ProjectMatchingResult,
} from '~/lib/services/project-matching/schemas'

export const maxDuration = 30

const DEFAULT_MATCHING_MODEL = 'google/gemini-2.5-flash-lite'
const MIN_CANDIDATES = 3
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface MatchingCacheEntry {
	userContext: UserMatchingContext
	candidates: MatchingCandidateProject[]
	cachedAt: number
}

const matchingCache = new Map<string, MatchingCacheEntry>()

export async function POST(request: Request) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const userId = session.user.id
		const { supabase } = await import('@packages/lib/supabase')

		const forceRefresh = request.headers.get('x-invalidate-cache') === 'true'
		const cached = matchingCache.get(userId)
		const isCacheValid =
			!forceRefresh && cached !== undefined && Date.now() - cached.cachedAt < CACHE_TTL_MS

		let userContext: UserMatchingContext
		let candidates: MatchingCandidateProject[]

		if (isCacheValid) {
			userContext = cached.userContext
			candidates = cached.candidates
		} else {
			;[userContext, candidates] = await Promise.all([
				buildUserMatchingContext(supabase, userId),
				fetchMatchingCandidates(supabase, userId),
			])
			matchingCache.set(userId, { userContext, candidates, cachedAt: Date.now() })
		}

		if (candidates.length < MIN_CANDIDATES) {
			return NextResponse.json(
				{
					error:
						'Not enough active projects are available for matching right now. Check back soon!',
				},
				{ status: 422 },
			)
		}

		const modelId = process.env.AI_PROJECT_MATCHING_MODEL ?? DEFAULT_MATCHING_MODEL
		const candidateMap = new Map(candidates.map((project) => [project.id, project]))

		const promptCandidates = preRankCandidates(userContext, candidates)

		const { object } = await generateObject({
			model: gateway(modelId),
			schema: matchingAiResponseSchema,
			schemaName: 'ProjectMatchingRecommendations',
			schemaDescription:
				'Personalized project recommendations for a KindFi donor based on their profile and history',
			system: MATCHING_SYSTEM_PROMPT,
			prompt: buildMatchingPrompt(userContext, promptCandidates),
			providerOptions: {
				gateway: {
					user: userId,
					tags: ['feature:project-matching'],
				},
			},
		})

		const recommendations = object.recommendations
			.map((rec) => {
				const project = candidateMap.get(rec.projectId)
				if (!project) return null
				return {
					projectId: project.id,
					slug: project.slug,
					title: project.title,
					description: project.description,
					image: project.image,
					projectLocation: project.projectLocation,
					category: project.category,
					tags: project.tags,
					goal: project.goal,
					raised: project.raised,
					investors: project.investors,
					percentageComplete: project.percentageComplete,
					matchScore: rec.matchScore,
					reason: rec.reason,
				}
			})
			.filter((rec): rec is NonNullable<typeof rec> => rec !== null)

		if (recommendations.length === 0) {
			logger.error('[profile/project-matching] AI returned invalid project ids')
			return NextResponse.json(
				{ error: 'Could not generate valid recommendations. Please try again.' },
				{ status: 503 },
			)
		}

		const result: ProjectMatchingResult = {
			summary: object.summary,
			recommendations,
			preferenceInsights: userContext.derivedPreferences,
		}

		return NextResponse.json(result)
	} catch (err) {
		logger.error('[profile/project-matching] Error:', err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
