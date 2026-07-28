import { describe, expect, test } from 'bun:test'
import type { UserMatchingContext } from './build-matching-context'
import { buildMatchingPrompt, preRankCandidates } from './build-matching-context'
import type { MatchingCandidateProject } from './schemas'
import { MAX_PROMPT_CANDIDATES } from './schemas'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeCandidate = (
	id: string,
	overrides: Partial<MatchingCandidateProject> = {},
): MatchingCandidateProject => ({
	id,
	slug: id,
	title: `Project ${id}`,
	description: `Description for ${id}`,
	projectLocation: 'United States',
	category: { id: 'cat-1', name: 'Education', slug: 'education', color: '#fff' },
	tags: [{ name: 'youth', color: null }],
	goal: 10000,
	raised: 5000,
	investors: 10,
	percentageComplete: 50,
	image: null,
	...overrides,
})

const coldStartContext: UserMatchingContext = {
	displayName: 'Alice',
	bio: null,
	country: 'US',
	role: 'donor',
	donationHistory: [],
	stats: { donationCount: 0, totalAmount: 0, questsCompleted: 0, streakDays: 0, referralCount: 0 },
	derivedPreferences: { topCategories: [], topRegions: [], topTags: [] },
}

const contextWithPreferences: UserMatchingContext = {
	...coldStartContext,
	derivedPreferences: {
		topCategories: ['Education'],
		topRegions: ['Mexico'],
		topTags: ['youth', 'literacy'],
	},
}

// ---------------------------------------------------------------------------
// preRankCandidates — truncation
// ---------------------------------------------------------------------------

describe('preRankCandidates — truncation', () => {
	test('returns at most MAX_PROMPT_CANDIDATES items when given more candidates', () => {
		const candidates = Array.from({ length: 50 }, (_, i) => makeCandidate(`p${i}`))
		const result = preRankCandidates(coldStartContext, candidates)
		expect(result.length).toBe(MAX_PROMPT_CANDIDATES)
	})

	test('returns all candidates when fewer than MAX_PROMPT_CANDIDATES exist', () => {
		const candidates = [makeCandidate('a'), makeCandidate('b')]
		const result = preRankCandidates(coldStartContext, candidates)
		expect(result.length).toBe(2)
	})

	test('respects a custom limit override', () => {
		const candidates = Array.from({ length: 30 }, (_, i) => makeCandidate(`p${i}`))
		const result = preRankCandidates(coldStartContext, candidates, 5)
		expect(result.length).toBe(5)
	})
})

// ---------------------------------------------------------------------------
// preRankCandidates — scoring
// ---------------------------------------------------------------------------

describe('preRankCandidates — scoring', () => {
	test('candidate matching category + region + tags ranks first', () => {
		const best = makeCandidate('best', {
			category: { id: 'c1', name: 'Education', slug: 'edu', color: '#fff' },
			projectLocation: 'Mexico',
			tags: [
				{ name: 'youth', color: null },
				{ name: 'literacy', color: null },
			],
		})
		const worst = makeCandidate('worst', {
			category: { id: 'c2', name: 'Health', slug: 'health', color: '#fff' },
			projectLocation: 'Brazil',
			tags: [{ name: 'medicine', color: null }],
		})
		const result = preRankCandidates(contextWithPreferences, [worst, best])
		expect(result[0].id).toBe('best')
	})

	test('category match alone outranks no-match candidate', () => {
		const withCategory = makeCandidate('cat-match', {
			category: { id: 'c1', name: 'Education', slug: 'edu', color: '#fff' },
			projectLocation: 'Brazil',
			tags: [],
		})
		const noMatch = makeCandidate('no-match', {
			category: { id: 'c2', name: 'Health', slug: 'health', color: '#fff' },
			projectLocation: 'Brazil',
			tags: [],
		})
		const result = preRankCandidates(contextWithPreferences, [noMatch, withCategory])
		expect(result[0].id).toBe('cat-match')
	})

	test('maps candidates to PromptCandidateProject shape with truncated description', () => {
		const longDesc = 'x'.repeat(300)
		const candidate = makeCandidate('p1', { description: longDesc })
		const result = preRankCandidates(coldStartContext, [candidate])
		expect(result[0].description.length).toBeLessThanOrEqual(150)
		expect(result[0]).toHaveProperty('id', 'p1')
		expect(result[0]).toHaveProperty('category')
		expect(result[0]).toHaveProperty('tags')
	})
})

// ---------------------------------------------------------------------------
// preRankCandidates — cold-start
// ---------------------------------------------------------------------------

describe('preRankCandidates — cold-start', () => {
	test('returns results without error when user has no preferences', () => {
		const candidates = Array.from({ length: 10 }, (_, i) => makeCandidate(`p${i}`))
		expect(() => preRankCandidates(coldStartContext, candidates)).not.toThrow()
	})

	test('preserves original order for cold-start users (all scores equal zero)', () => {
		const candidates = ['first', 'second', 'third'].map((id) => makeCandidate(id))
		const result = preRankCandidates(coldStartContext, candidates, 3)
		expect(result.map((r) => r.id)).toEqual(['first', 'second', 'third'])
	})
})

// ---------------------------------------------------------------------------
// buildMatchingPrompt — bounded size
// ---------------------------------------------------------------------------

describe('buildMatchingPrompt — bounded size', () => {
	test('prompt with MAX_PROMPT_CANDIDATES candidates stays within character budget', () => {
		const candidates = Array.from({ length: MAX_PROMPT_CANDIDATES }, (_, i) =>
			makeCandidate(`p${i}`),
		)
		const promptCandidates = preRankCandidates(coldStartContext, candidates)
		const prompt = buildMatchingPrompt(coldStartContext, promptCandidates)
		// Generous upper bound: 20 candidates × ~300 chars each + ~1500 for user section
		expect(prompt.length).toBeLessThan(20 * 300 + 1500)
	})

	test('each candidate id appears exactly once in the prompt', () => {
		const candidates = [makeCandidate('alpha'), makeCandidate('beta')]
		const promptCandidates = preRankCandidates(coldStartContext, candidates)
		const prompt = buildMatchingPrompt(coldStartContext, promptCandidates)
		expect(prompt).toContain('[alpha]')
		expect(prompt).toContain('[beta]')
	})
})
