export type ResolvedUserId =
	| { status: 'provided'; userId: string }
	| { status: 'resolved'; userId: string }
	| { status: 'unavailable'; reason: string }

export interface AuthUserFetchResponse {
	ok: boolean
	status: number
	json: () => Promise<unknown>
}

export interface ResolveAuthenticatedUserIdParams {
	userId?: string
	fetchUser: (input: string) => Promise<AuthUserFetchResponse>
}

const AUTH_USER_ENDPOINT = '/api/auth/user'

/**
 * Normalizes a possibly-untrusted user id. Surrounding whitespace is trimmed and
 * `null`, `undefined`, `''` and whitespace-only values all collapse to `null`, so
 * an empty string can never masquerade as a resolved principal.
 */
export function normalizeUserId(value: string | null | undefined): string | null {
	if (typeof value !== 'string') return null
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : null
}

function readId(value: unknown): string | null {
	return typeof value === 'string' ? normalizeUserId(value) : null
}

function extractUserId(payload: unknown): string | null {
	if (payload === null || typeof payload !== 'object') return null
	const record = payload as Record<string, unknown>
	const user = record.user
	if (user !== null && typeof user === 'object') {
		const nested = readId((user as Record<string, unknown>).id)
		if (nested) return nested
	}
	// Defensive: tolerate a top-level `id` if the endpoint ever flattens the payload.
	return readId(record.id)
}

/**
 * Resolves the authenticated user id used for KYC-gated requests.
 *
 * Contract:
 * - A non-empty `userId` prop wins and is returned as `provided` with **no** fetch.
 * - Otherwise the auth endpoint is called exactly once and only on success is the
 *   id returned, as `resolved`.
 * - Every failure path returns `unavailable` with a machine-readable `reason`
 *   (`network_error`, `http_<status>`, `invalid_payload`, `missing_id`). This
 *   function never throws and never returns an empty id, so a caller can never
 *   silently proceed as if the gate were disabled.
 */
export async function resolveAuthenticatedUserId(
	params: ResolveAuthenticatedUserIdParams,
): Promise<ResolvedUserId> {
	const provided = normalizeUserId(params.userId)
	if (provided) {
		return { status: 'provided', userId: provided }
	}

	let response: AuthUserFetchResponse
	try {
		response = await params.fetchUser(AUTH_USER_ENDPOINT)
	} catch {
		return { status: 'unavailable', reason: 'network_error' }
	}

	if (!response.ok) {
		return { status: 'unavailable', reason: `http_${response.status}` }
	}

	let payload: unknown
	try {
		payload = await response.json()
	} catch {
		return { status: 'unavailable', reason: 'invalid_payload' }
	}

	const id = extractUserId(payload)
	if (!id) {
		return { status: 'unavailable', reason: 'missing_id' }
	}

	return { status: 'resolved', userId: id }
}
