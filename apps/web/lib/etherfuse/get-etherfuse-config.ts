import { appEnvConfig } from '@packages/lib/config'
import { AppError } from '~/lib/error'

export type EtherfuseConfig = {
	apiKey: string
	baseUrl: string
	customerId: string
	bankAccountId: string
	cryptoWalletId: string
}

let cachedOrganizationId: string | null = null

const resolveOrganizationId = async (
	apiKey: string,
	baseUrl: string,
	timeoutMs = 5000,
): Promise<string | null> => {
	if (cachedOrganizationId) {
		return cachedOrganizationId
	}

	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

	try {
		const response = await fetch(`${baseUrl}/ramp/me`, {
			headers: { Authorization: apiKey },
			signal: controller.signal,
		})

		if (!response.ok) {
			return null
		}

		const data = (await response.json()) as { id?: string }
		if (data.id) {
			cachedOrganizationId = data.id
		}

		return data.id ?? null
	} catch (error: unknown) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new AppError('Etherfuse API request timed out while resolving organization ID.', 504)
		}
		throw error
	} finally {
		clearTimeout(timeoutId)
	}
}

export const getEtherfuseConfig = async (): Promise<EtherfuseConfig> => {
	const config = appEnvConfig('web')
	const { apiKey, baseUrl } = config.externalApis.etherfuse
	let { customerId } = config.externalApis.etherfuse

	const bankAccountId = process.env.ETHERFUSE_BANK_ACCOUNT_ID ?? ''
	const cryptoWalletId = process.env.ETHERFUSE_CRYPTO_WALLET_ID ?? ''

	const missing: string[] = []
	if (!apiKey) missing.push('ETHERFUSE_API_KEY')
	if (!baseUrl) missing.push('ETHERFUSE_BASE_URL')

	if (!customerId && apiKey && baseUrl) {
		customerId = (await resolveOrganizationId(apiKey, baseUrl)) ?? ''
	}
	if (!customerId) {
		missing.push('ETHERFUSE_CUSTOMER_ID (or a valid API key for GET /ramp/me)')
	}

	if (missing.length > 0) {
		throw new AppError(
			`Etherfuse configuration is incomplete. Missing: ${missing.join(', ')}. Add them to apps/web/.env.local and restart the dev server.`,
			500,
		)
	}

	return {
		apiKey,
		baseUrl,
		customerId,
		bankAccountId,
		cryptoWalletId,
	}
}
