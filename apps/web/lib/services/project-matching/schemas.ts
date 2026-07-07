import { z } from 'zod'

export const matchingAiResponseSchema = z.object({
	summary: z
		.string()
		.describe('A brief 2-3 sentence personalized intro explaining the match rationale'),
	recommendations: z
		.array(
			z.object({
				projectId: z.string().describe('Must be an id from the provided candidate projects list'),
				matchScore: z.number().min(1).max(100).describe('How well this project fits the user'),
				reason: z
					.string()
					.describe('One concise sentence explaining why this project matches the user'),
			}),
		)
		.min(1)
		.max(5),
})

export type MatchingAiResponse = z.infer<typeof matchingAiResponseSchema>

export interface MatchingCandidateProject {
	id: string
	slug: string
	title: string
	description: string | null
	projectLocation: string
	category: { id: string; name: string; slug: string | null; color: string } | null
	tags: Array<{ name: string; color: string | null }>
	goal: number
	raised: number
	investors: number
	percentageComplete: number | null
	image: string | null
}

export interface ProjectMatchRecommendation {
	projectId: string
	slug: string
	title: string
	description: string | null
	image: string | null
	projectLocation: string
	category: MatchingCandidateProject['category']
	tags: MatchingCandidateProject['tags']
	goal: number
	raised: number
	investors: number
	percentageComplete: number | null
	matchScore: number
	reason: string
}

export interface ProjectMatchingResult {
	summary: string
	recommendations: ProjectMatchRecommendation[]
	preferenceInsights: {
		topCategories: string[]
		topRegions: string[]
		topTags: string[]
	}
}
