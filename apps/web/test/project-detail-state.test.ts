import { afterEach, describe, expect, test } from 'bun:test'
import {
	fetchProjectDetail,
	type ProjectDetail,
	ProjectDetailFetchError,
	resolveProjectDetailViewState,
} from '~/lib/utils/projects/project-detail-state'

const originalFetch = global.fetch

afterEach(() => {
	global.fetch = originalFetch
})

// A minimal stand-in for a loaded project. The decision logic only cares
// whether the payload is truthy, so a partial object cast to the full type
// keeps the test focused without reconstructing every field.
const sampleProject = {
	id: 'p1',
	title: 'Clean Water',
	slug: 'clean-water',
} as unknown as NonNullable<ProjectDetail>

describe('fetchProjectDetail', () => {
	test('returns the parsed payload on a 200 response', async () => {
		global.fetch = (async () =>
			new Response(JSON.stringify(sampleProject), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			})) as typeof fetch

		const result = await fetchProjectDetail('clean-water')
		expect(result).toEqual(sampleProject)
	})

	test('returns null on a 404 (confirmed missing project)', async () => {
		global.fetch = (async () => new Response(null, { status: 404 })) as typeof fetch

		const result = await fetchProjectDetail('missing')
		expect(result).toBeNull()
	})

	test('throws with the status on a 500 response', async () => {
		global.fetch = (async () => new Response('boom', { status: 500 })) as typeof fetch

		expect(fetchProjectDetail('clean-water')).rejects.toMatchObject({
			name: 'ProjectDetailFetchError',
			status: 500,
		})
	})

	test('throws on a network/offline failure with no status', async () => {
		global.fetch = (async () => {
			throw new TypeError('Failed to fetch')
		}) as typeof fetch

		let caught: unknown
		try {
			await fetchProjectDetail('clean-water')
		} catch (error) {
			caught = error
		}

		expect(caught).toBeInstanceOf(ProjectDetailFetchError)
		expect((caught as ProjectDetailFetchError).status).toBeUndefined()
	})
})

describe('resolveProjectDetailViewState', () => {
	test('shows skeletons during the initial load', () => {
		expect(
			resolveProjectDetailViewState({ data: undefined, isLoading: true, isError: false }),
		).toBe('loading')
	})

	test('renders the recoverable error state on a 500/offline failure with no content', () => {
		expect(
			resolveProjectDetailViewState({ data: undefined, isLoading: false, isError: true }),
		).toBe('error')
	})

	test('reports not-found for a confirmed null payload (404)', () => {
		expect(resolveProjectDetailViewState({ data: null, isLoading: false, isError: false })).toBe(
			'not-found',
		)
	})

	test('shows content when the project resolves successfully', () => {
		expect(
			resolveProjectDetailViewState({
				data: sampleProject,
				isLoading: false,
				isError: false,
			}),
		).toBe('content')
	})

	test('keeps previously loaded content when a background refetch fails', () => {
		expect(
			resolveProjectDetailViewState({
				data: sampleProject,
				isLoading: false,
				isError: true,
			}),
		).toBe('content')
	})

	test('does not report not-found while settled without data or error', () => {
		expect(
			resolveProjectDetailViewState({ data: undefined, isLoading: false, isError: false }),
		).toBe('loading')
	})
})
