'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getAllProjects } from '~/lib/queries/projects/get-all-projects'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'

/** Number of projects fetched per page. */
export const PROJECTS_PAGE_SIZE = 12

export interface UsePaginatedProjectsOptions {
	categorySlugs: string[]
	sortSlug: string
	language: SupportedLocale
	pageSize?: number
}

/**
 * Fetches projects in bounded pages using TanStack `useInfiniteQuery`.
 *
 * - Initial render: only the first page (up to `pageSize` items) is fetched.
 * - Subsequent pages are fetched on demand via `fetchNextPage`.
 * - Changing `categorySlugs`, `sortSlug`, or `language` resets to page 0.
 * - Already-rendered cards are never remounted when loading additional pages.
 */
export function usePaginatedProjects({
	categorySlugs,
	sortSlug,
	language,
	pageSize = PROJECTS_PAGE_SIZE,
}: UsePaginatedProjectsOptions) {
	const categoryKey = categorySlugs.join(',')

	return useInfiniteQuery({
		queryKey: ['projects-paginated', categoryKey, sortSlug, language, pageSize] as const,
		queryFn: async ({ pageParam = 0 }) => {
			const supabase = createSupabaseBrowserClient()
			return getAllProjects(supabase, categorySlugs, sortSlug, pageSize, { viewerLocale: language }, pageParam)
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		staleTime: 1000 * 60 * 2, // 2 minutes — fresh enough for the catalog
		gcTime: 1000 * 60 * 10,
	})
}
