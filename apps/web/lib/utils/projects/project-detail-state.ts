import type { getProjectBySlug } from '~/lib/queries/projects/get-project-by-slug'

export type ProjectDetail = Awaited<ReturnType<typeof getProjectBySlug>>

/**
 * Error thrown when the project detail request fails for a reason other than a
 * confirmed 404. Carries the HTTP status (when known) so callers can tell a
 * recoverable failure apart from a missing resource.
 */
export class ProjectDetailFetchError extends Error {
	readonly status?: number

	constructor(message: string, status?: number) {
		super(message)
		this.name = 'ProjectDetailFetchError'
		this.status = status
	}
}

/**
 * Fetch a project detail payload by slug.
 *
 * - HTTP 404 resolves to `null` so the caller can render the missing-project
 *   experience.
 * - Any other non-OK response (e.g. 500) or a network/offline failure throws a
 *   {@link ProjectDetailFetchError}, which TanStack Query surfaces as an error
 *   state rather than a missing project.
 */
export async function fetchProjectDetail(projectSlug: string): Promise<ProjectDetail> {
	let response: Response
	try {
		response = await fetch(`/api/projects/${projectSlug}`)
	} catch (cause) {
		// Network error / offline — no HTTP status available.
		throw new ProjectDetailFetchError(
			cause instanceof Error ? cause.message : 'Network request failed',
		)
	}

	if (response.status === 404) {
		return null
	}

	if (!response.ok) {
		throw new ProjectDetailFetchError('Failed to load project', response.status)
	}

	return response.json()
}

/** Minimal view of the TanStack Query state the decision logic depends on. */
export type ProjectDetailQueryState = {
	data: ProjectDetail | undefined
	isLoading: boolean
	isError: boolean
}

export type ProjectDetailViewState =
	/** Initial load with no cached data yet — show skeletons. */
	| 'loading'
	/** Confirmed 404 (null payload) — render the missing-project experience. */
	| 'not-found'
	/** Request failed and there is no previously loaded content — show retry UI. */
	| 'error'
	/** Project content is available (including during a background refetch). */
	| 'content'

/**
 * Decide what the project detail view should render from the query state.
 *
 * Resolution order (precedence matters):
 * 1. Previously loaded content is kept whenever it exists, so a failed
 *    background refetch never clears a project that was already on screen.
 * 2. The initial load shows skeletons.
 * 3. A failure with no content shows the recoverable error state.
 * 4. A resolved `null` payload is a confirmed 404 → not found.
 * 5. Otherwise, content is ready.
 */
export function resolveProjectDetailViewState({
	data,
	isLoading,
	isError,
}: ProjectDetailQueryState): ProjectDetailViewState {
	// A truthy project means we have content to show, even if a background
	// refetch is currently failing.
	if (data) {
		return 'content'
	}

	if (isLoading) {
		return 'loading'
	}

	if (isError) {
		return 'error'
	}

	// Loading finished without an error and the payload is null → confirmed 404.
	if (data === null) {
		return 'not-found'
	}

	// Settled with `undefined` and no error (e.g. query disabled) — keep showing
	// skeletons rather than falsely reporting a missing project.
	return 'loading'
}
