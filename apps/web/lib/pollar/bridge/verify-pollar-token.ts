import { appEnvConfig } from '@packages/lib/config'
import { isExternalStellarWalletAddress } from '@packages/lib/utils/wallet-address'
import jwt from 'jsonwebtoken'
import { logger } from '@/lib/logger'

const POLLAR_API_DEFAULT = 'https://api.pollar.xyz'

export interface PollarClientSessionProof {
	accessToken: string
	pollarUserId: string
	walletAddress: string
	email: string | null
	authProvider: string | null
	network: string
	profile?: {
		firstName?: string | null
		lastName?: string | null
		avatar?: string | null
	}
}

export interface PollarVerifiedSession {
	pollarUserId: string
	email: string | null
	walletAddress: string
	authProvider: string | null
	network: string
	expiresAt: string | null
	profile?: {
		firstName?: string | null
		lastName?: string | null
		avatar?: string | null
	}
}

interface PollarApiEnvelope<T> {
	content?: T
	code?: string
	success: boolean
	message?: string
}

interface PollarVerifiedTokenContent {
	userId: string
	applicationId?: string
	expiresAt?: string | number
	network?: string
	wallet?: {
		address?: string
		network?: string
		provider?: string | null
	}
	profile?: {
		mail?: string | null
		first_name?: string | null
		last_name?: string | null
		avatar?: string | null
	}
	authProvider?: string | null
}

interface PollarAccessTokenPayload {
	sub: string
	applicationId?: string
	type?: string
	exp: number
}

const getPollarServerConfig = () => {
	const config = appEnvConfig('web')
	return {
		secretKey: config.externalApis.pollar.secretKey,
		managementBaseUrl: config.externalApis.pollar.apiBaseUrl || POLLAR_API_DEFAULT,
	}
}

const parsePollarJson = <T>(text: string): T => {
	try {
		return JSON.parse(text) as T
	} catch {
		throw new Error('Pollar API returned a non-JSON response')
	}
}

const mapTokenVerifyError = (code: string | undefined, status: number): string => {
	switch (code) {
		case 'SDK_AUTH_TOKEN_EXPIRED':
			return 'Pollar session has expired. Please sign in again.'
		case 'SDK_AUTH_INVALID_TOKEN':
			return 'Pollar access token is invalid. Please sign in again.'
		case 'SDK_TOKEN_WRONG_APPLICATION':
			return 'Pollar token does not match this app. Ensure publishable and secret keys are from the same Pollar application and network.'
		case 'API_KEY_TYPE_NOT_ALLOWED':
			return 'POLLAR_SECRET_KEY must be a secret key (sec_testnet_… or sec_mainnet_…), not a publishable key.'
		default:
			return `Pollar access token verification failed (${code ?? `HTTP_${status}`})`
	}
}

/**
 * Preferred path: POST /v1/tokens/verify on the Pollar Server API.
 * Returns null when the route is not deployed yet (observed 404 on api.pollar.xyz).
 */
const verifyTokenWithPollarApi = async (
	accessToken: string,
): Promise<PollarVerifiedTokenContent | null> => {
	const { secretKey, managementBaseUrl } = getPollarServerConfig()
	if (!secretKey) {
		throw new Error('POLLAR_SECRET_KEY is not configured')
	}

	const response = await fetch(`${managementBaseUrl}/v1/tokens/verify`, {
		method: 'POST',
		headers: {
			'x-pollar-api-key': secretKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ token: accessToken }),
		cache: 'no-store',
	})

	const text = await response.text()

	if (response.status === 404) {
		logger.warn(
			'[Pollar] POST /v1/tokens/verify is unavailable (404). Falling back to SDK JWT claim validation.',
		)
		return null
	}

	const payload = parsePollarJson<PollarApiEnvelope<PollarVerifiedTokenContent>>(text)

	if (!response.ok || !payload.success || !payload.content) {
		const message = mapTokenVerifyError(payload.code, response.status)
		logger.warn('[Pollar] token verify failed', {
			status: response.status,
			code: payload.code,
		})
		throw new Error(message)
	}

	return payload.content
}

const verifyPollarJwtWithSecret = (accessToken: string): PollarAccessTokenPayload | null => {
	const { secretKey } = getPollarServerConfig()
	if (!secretKey) {
		return null
	}

	try {
		const payload = jwt.verify(accessToken, secretKey, {
			algorithms: ['HS256'],
		}) as PollarAccessTokenPayload

		if (!payload.sub) {
			return null
		}

		if (payload.type && payload.type !== 'sdk') {
			return null
		}

		return payload
	} catch {
		return null
	}
}

/**
 * Fallback when Server API verify is unavailable and HS256 with POLLAR_SECRET_KEY fails.
 * The browser only sends this proof after the SDK session is `verified` (DPoP + resume).
 */
const verifyPollarJwtClaims = (accessToken: string): PollarAccessTokenPayload => {
	const decoded = jwt.decode(accessToken, { complete: true })
	if (!decoded || typeof decoded === 'string') {
		throw new Error('Pollar access token is malformed')
	}

	const payload = decoded.payload as PollarAccessTokenPayload
	if (!payload.sub) {
		throw new Error('Pollar token is missing subject')
	}

	if (payload.type && payload.type !== 'sdk') {
		throw new Error('Invalid Pollar token type')
	}

	const now = Math.floor(Date.now() / 1000)
	if (!payload.exp || payload.exp <= now) {
		throw new Error('Pollar session has expired. Please sign in again.')
	}

	return payload
}

const resolveVerifiedTokenContent = async (
	accessToken: string,
): Promise<PollarVerifiedTokenContent> => {
	const fromApi = await verifyTokenWithPollarApi(accessToken)
	if (fromApi) {
		return fromApi
	}

	const fromSecret = verifyPollarJwtWithSecret(accessToken)
	if (fromSecret) {
		return {
			userId: fromSecret.sub,
			applicationId: fromSecret.applicationId,
			expiresAt: fromSecret.exp,
		}
	}

	const claims = verifyPollarJwtClaims(accessToken)
	return {
		userId: claims.sub,
		applicationId: claims.applicationId,
		expiresAt: claims.exp,
	}
}

const normalizeExpiresAt = (expiresAt: string | number | undefined): string | null => {
	if (expiresAt === undefined || expiresAt === null) {
		return null
	}

	if (typeof expiresAt === 'number') {
		const ms = expiresAt < 1_000_000_000_000 ? expiresAt * 1000 : expiresAt
		return new Date(ms).toISOString()
	}

	const parsed = Date.parse(expiresAt)
	return Number.isNaN(parsed) ? null : new Date(parsed).toISOString()
}

/**
 * Verifies a Pollar SDK session:
 * - Prefer POST /v1/tokens/verify when available
 * - Else validate SDK JWT claims from a verified browser session proof
 */
export const verifyPollarAccessToken = async (
	proof: PollarClientSessionProof,
): Promise<PollarVerifiedSession> => {
	const verified = await resolveVerifiedTokenContent(proof.accessToken)

	if (proof.pollarUserId && proof.pollarUserId !== verified.userId) {
		throw new Error('Pollar user id mismatch')
	}

	const walletAddress = verified.wallet?.address ?? proof.walletAddress
	if (!walletAddress || !isExternalStellarWalletAddress(walletAddress)) {
		throw new Error('Pollar session does not include a valid G-address wallet')
	}

	if (
		proof.walletAddress &&
		proof.walletAddress !== walletAddress &&
		isExternalStellarWalletAddress(proof.walletAddress)
	) {
		throw new Error('Pollar wallet address mismatch')
	}

	const email =
		verified.profile?.mail?.trim().toLowerCase() || proof.email?.trim().toLowerCase() || null

	if (!email) {
		throw new Error('Pollar account must include an email to link with KindFi')
	}

	return {
		pollarUserId: verified.userId,
		email,
		walletAddress,
		authProvider: verified.authProvider ?? proof.authProvider,
		network: verified.network ?? verified.wallet?.network ?? proof.network ?? 'testnet',
		expiresAt: normalizeExpiresAt(verified.expiresAt),
		profile: {
			firstName: verified.profile?.first_name ?? proof.profile?.firstName ?? null,
			lastName: verified.profile?.last_name ?? proof.profile?.lastName ?? null,
			avatar: verified.profile?.avatar ?? proof.profile?.avatar ?? null,
		},
	}
}

const callManagementApi = async (
	path: string,
	body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number }> => {
	const { secretKey, managementBaseUrl } = getPollarServerConfig()
	if (!secretKey) {
		logger.warn(`[Pollar] Skipping ${path} — POLLAR_SECRET_KEY is not configured`)
		return { ok: false, status: 0 }
	}

	const response = await fetch(`${managementBaseUrl}${path}`, {
		method: 'POST',
		headers: {
			'x-pollar-api-key': secretKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
		cache: 'no-store',
	})

	if (response.status === 404) {
		logger.warn(
			`[Pollar] Management API ${path} is unavailable (404). Skipping until Pollar exposes this endpoint.`,
		)
		return { ok: false, status: 404 }
	}

	const text = await response.text()
	const payload = parsePollarJson<PollarApiEnvelope<unknown>>(text)
	if (!response.ok || !payload.success) {
		const code = payload.code ?? `HTTP_${response.status}`
		throw new Error(`Pollar management API ${path} failed: ${code}`)
	}

	return { ok: true, status: response.status }
}

/**
 * Activates a deferred Pollar wallet (funds XLM reserve).
 * Best-effort: no-ops when the management API is not yet available.
 */
export const activatePollarWallet = async (publicKey: string): Promise<void> => {
	const result = await callManagementApi('/v1/wallets/activate', { publicKey })
	if (!result.ok && result.status !== 404) {
		throw new Error('Pollar wallet activation failed')
	}
}

/**
 * Registers KindFi profile id as Pollar externalId for cross-system identity.
 * Best-effort: no-ops when the management API is not yet available.
 */
export const registerPollarExternalUser = async (input: {
	externalId: string
	email?: string | null
	firstName?: string | null
	lastName?: string | null
	avatar?: string | null
}): Promise<void> => {
	const result = await callManagementApi('/v1/users', {
		externalId: input.externalId,
		email: input.email ?? undefined,
		firstName: input.firstName ?? undefined,
		lastName: input.lastName ?? undefined,
		avatar: input.avatar ?? undefined,
	})
	if (!result.ok && result.status !== 404) {
		throw new Error('Pollar user registration failed')
	}
}
