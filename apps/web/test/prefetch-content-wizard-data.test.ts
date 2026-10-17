import { describe, expect, test } from 'bun:test'
import { prefetchContentWizardData } from '../lib/queries/projects/prefetch-content-wizard-data'

describe('prefetchContentWizardData', () => {
	test('loads basic info once, caches that result, and overlaps pitch with highlights', async () => {
		const basicInfo = { id: 'project-1', title: 'Example' }
		let basicInfoCalls = 0
		let cached: typeof basicInfo | null | undefined
		let activePrefetches = 0
		let maximumConcurrentPrefetches = 0
		const trackPrefetch = async () => {
			activePrefetches += 1
			maximumConcurrentPrefetches = Math.max(maximumConcurrentPrefetches, activePrefetches)
			await new Promise((resolve) => setTimeout(resolve, 0))
			activePrefetches -= 1
		}

		const operation = prefetchContentWizardData({
			getBasicInfo: async () => {
				basicInfoCalls += 1
				return basicInfo
			},
			cacheBasicInfo: (data) => {
				cached = data
			},
			prefetchPitch: trackPrefetch,
			prefetchHighlights: trackPrefetch,
		})

		expect(await operation).toBe(basicInfo)
		expect(basicInfoCalls).toBe(1)
		expect(cached).toBe(basicInfo)
		expect(maximumConcurrentPrefetches).toBe(2)
	})

	test('still prefetches highlights when basic info is missing, but skips pitch', async () => {
		let pitchCalls = 0
		let highlightsCalls = 0
		let cached: { id?: string | null } | null | undefined

		const result = await prefetchContentWizardData({
			getBasicInfo: async () => null,
			cacheBasicInfo: (data) => {
				cached = data
			},
			prefetchPitch: async () => {
				pitchCalls += 1
			},
			prefetchHighlights: async () => {
				highlightsCalls += 1
			},
		})

		expect(result).toBeNull()
		expect(cached).toBeNull()
		expect(pitchCalls).toBe(0)
		expect(highlightsCalls).toBe(1)
	})
})
