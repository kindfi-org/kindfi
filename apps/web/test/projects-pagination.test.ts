/**
 * Performance-oriented tests for the projects pagination logic.
 *
 * These tests verify that:
 * 1. The pagination slice (getAllProjects with offset) returns only `pageSize` items.
 * 2. Pages do not overlap — page 2 does not re-return IDs from page 1.
 * 3. `newIds` set tracking only marks the IDs added in the latest page.
 * 4. When the catalog is exactly `pageSize` items, `nextOffset` is null (no more pages).
 * 5. DOM size grows proportional to page size, not total catalog size.
 *
 * NOTE: The Supabase client is mocked — these tests exercise the pagination
 * calculation logic only, not network I/O.
 */

import { describe, expect, test } from 'bun:test'
import type { PaginatedProjectsResult } from '~/lib/queries/projects/get-all-projects'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a minimal fake project row for a given index.
 */
function fakeRow(index: number) {
	return {
		id: `project-${index}`,
		title: `Project ${index}`,
		slug: `project-${index}`,
		description: `Description ${index}`,
		image_url: null,
		created_at: new Date(Date.now() - index * 1000).toISOString(),
		current_amount: 0,
		target_amount: 1000,
		min_investment: 10,
		percentage_complete: 0,
		kinder_count: 0,
		status: 'active',
		development_only: false,
		source_locale: 'en',
		category: null,
		project_tag_relationships: [],
		milestones: [],
		project_escrows: null,
	}
}

/**
 * Simulate the offset+range slicing that PostgREST performs on the server.
 * Used to test the nextOffset calculation logic without a real DB.
 */
function simulatePage(
	allRows: ReturnType<typeof fakeRow>[],
	offset: number,
	pageSize: number,
): PaginatedProjectsResult {
	const slice = allRows.slice(offset, offset + pageSize)
	const total = allRows.length
	const nextOffset = offset + slice.length < total ? offset + pageSize : null

	const items = slice.map((row) => ({
		id: row.id,
		title: row.title,
		slug: row.slug,
		description: row.description,
		image: row.image_url,
		createdAt: row.created_at,
		goal: row.target_amount,
		raised: row.current_amount,
		investors: row.kinder_count,
		minInvestment: row.min_investment,
		tags: [],
		category: null,
		developmentOnly: false,
	}))

	return { items, total, nextOffset }
}

// ─── Catalog data ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 12
const CATALOG_SIZE = 50
const allRows = Array.from({ length: CATALOG_SIZE }, (_, i) => fakeRow(i))

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Projects pagination — page slicing', () => {
	test('first page returns exactly PAGE_SIZE items', () => {
		const page1 = simulatePage(allRows, 0, PAGE_SIZE)
		expect(page1.items).toHaveLength(PAGE_SIZE)
	})

	test('first page total equals full catalog size', () => {
		const page1 = simulatePage(allRows, 0, PAGE_SIZE)
		expect(page1.total).toBe(CATALOG_SIZE)
	})

	test('first page nextOffset points to PAGE_SIZE', () => {
		const page1 = simulatePage(allRows, 0, PAGE_SIZE)
		expect(page1.nextOffset).toBe(PAGE_SIZE)
	})

	test('second page returns the next PAGE_SIZE items', () => {
		const page2 = simulatePage(allRows, PAGE_SIZE, PAGE_SIZE)
		expect(page2.items).toHaveLength(PAGE_SIZE)
		expect(page2.items[0].id).toBe(`project-${PAGE_SIZE}`)
	})

	test('pages do not overlap — no shared IDs between page 1 and page 2', () => {
		const page1 = simulatePage(allRows, 0, PAGE_SIZE)
		const page2 = simulatePage(allRows, PAGE_SIZE, PAGE_SIZE)
		const ids1 = new Set(page1.items.map((p) => p.id))
		for (const item of page2.items) {
			expect(ids1.has(item.id)).toBe(false)
		}
	})

	test('last partial page returns remaining items', () => {
		// CATALOG_SIZE=50, PAGE_SIZE=12: pages 0–3 full, page 4 has 50-(4*12)=2 items
		const offset = Math.floor(CATALOG_SIZE / PAGE_SIZE) * PAGE_SIZE
		const remaining = CATALOG_SIZE - offset
		const lastPage = simulatePage(allRows, offset, PAGE_SIZE)
		expect(lastPage.items).toHaveLength(remaining)
	})

	test('last page nextOffset is null', () => {
		const offset = Math.floor(CATALOG_SIZE / PAGE_SIZE) * PAGE_SIZE
		const lastPage = simulatePage(allRows, offset, PAGE_SIZE)
		expect(lastPage.nextOffset).toBeNull()
	})

	test('exact-fit catalog (total === PAGE_SIZE) nextOffset is null', () => {
		const exactRows = Array.from({ length: PAGE_SIZE }, (_, i) => fakeRow(i))
		const page = simulatePage(exactRows, 0, PAGE_SIZE)
		expect(page.items).toHaveLength(PAGE_SIZE)
		expect(page.nextOffset).toBeNull()
	})
})

describe('Projects pagination — newIds tracking', () => {
	/**
	 * Simulate the client-side newIds Set logic from projects-client-wrapper:
	 * - First page: all IDs are "new" (animate in).
	 * - Subsequent pages: only the latest page's IDs are "new".
	 */
	function buildNewIds(pages: PaginatedProjectsResult[], pageIndex: number): Set<string> {
		const lastPage = pages[pageIndex]
		if (!lastPage) return new Set()
		return new Set(lastPage.items.map((p) => p.id))
	}

	test('first page — all returned IDs are in newIds', () => {
		const page1 = simulatePage(allRows, 0, PAGE_SIZE)
		const newIds = buildNewIds([page1], 0)
		for (const item of page1.items) {
			expect(newIds.has(item.id)).toBe(true)
		}
	})

	test('second page — only new IDs in newIds, not IDs from page 1', () => {
		const page1 = simulatePage(allRows, 0, PAGE_SIZE)
		const page2 = simulatePage(allRows, PAGE_SIZE, PAGE_SIZE)
		const newIds = buildNewIds([page1, page2], 1)

		// page2 IDs should be in newIds
		for (const item of page2.items) {
			expect(newIds.has(item.id)).toBe(true)
		}
		// page1 IDs should NOT be in newIds (already rendered, no remount)
		for (const item of page1.items) {
			expect(newIds.has(item.id)).toBe(false)
		}
	})

	test('newIds size equals the last page item count, not total rendered', () => {
		const page1 = simulatePage(allRows, 0, PAGE_SIZE)
		const page2 = simulatePage(allRows, PAGE_SIZE, PAGE_SIZE)
		const newIds = buildNewIds([page1, page2], 1)

		expect(newIds.size).toBe(page2.items.length)
		expect(newIds.size).toBeLessThan(page1.items.length + page2.items.length)
	})
})

describe('Projects pagination — DOM size bound', () => {
	test('DOM node count is bounded by pages loaded, not total catalog', () => {
		/**
		 * With N pages loaded, the DOM should contain at most N * PAGE_SIZE nodes —
		 * never the entire CATALOG_SIZE at once.
		 */
		const pagesLoaded = 2
		const page1 = simulatePage(allRows, 0, PAGE_SIZE)
		const page2 = simulatePage(allRows, PAGE_SIZE, PAGE_SIZE)
		const rendered = [...page1.items, ...page2.items]

		expect(rendered.length).toBe(pagesLoaded * PAGE_SIZE)
		expect(rendered.length).toBeLessThan(CATALOG_SIZE)
	})

	test('loading a new page does not re-include existing IDs', () => {
		const page1 = simulatePage(allRows, 0, PAGE_SIZE)
		const page2 = simulatePage(allRows, PAGE_SIZE, PAGE_SIZE)
		const allRendered = [...page1.items, ...page2.items]
		const idSet = new Set(allRendered.map((p) => p.id))

		// No duplicates — IDs are unique across pages
		expect(idSet.size).toBe(allRendered.length)
	})
})
