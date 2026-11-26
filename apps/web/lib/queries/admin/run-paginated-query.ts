interface PaginatedQueryResponse {
	data: unknown
	error: { code?: string; message: string } | null
	count: number | null
}

/**
 * Executes a paginated admin query. When the requested page lies beyond the
 * result set, PostgREST rejects the range (PGRST103); instead of failing the
 * request, the query re-runs against the first row to recover the real total
 * so the UI can show an out-of-range state with navigation back into range.
 */
export async function runPaginatedAdminQuery<Row>(
	run: (from: number, to: number) => PromiseLike<PaginatedQueryResponse>,
	page: number,
	pageSize: number,
	label: string,
): Promise<{ rows: Row[]; total: number }> {
	const offset = (page - 1) * pageSize
	const result = await run(offset, offset + pageSize - 1)

	if (!result.error) {
		return { rows: (result.data ?? []) as Row[], total: result.count ?? 0 }
	}

	if (result.error.code === 'PGRST103') {
		const fallback = await run(0, 0)
		if (!fallback.error) {
			return { rows: [], total: fallback.count ?? 0 }
		}
	}

	throw new Error(`Failed to load ${label}: ${result.error.message}`)
}
