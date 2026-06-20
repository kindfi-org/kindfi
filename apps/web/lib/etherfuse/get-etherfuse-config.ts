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

const resolveOrganizationId = async (apiKey: string, baseUrl: string): Promise<string | null> => {
	if (cachedOrganizationId) {
		return cachedOrganizationId
	}

	const response = await fetch(`${baseUrl}/ramp/me`, {
		headers: { Authorization: apiKey },
	})

	if (!response.ok) {
		return null
	}

	const data = (await response.json()) as { id?: string }
	if (data.id) {
		cachedOrganizationId = data.id
	}

	return data.id ?? null
}

export const getEtherfuseConfig = async (): Promise<EtherfuseConfig> => {
	const config = appEnvConfig('web')
	const { apiKey, baseUrl } = config.externalApis.etherfuse
	let { customerId } = config.externalApis.etherfuse

	const bankAccountId = process.env.ETHERFUSE_BANK_ACCOUNT_ID ?? ''
	const cryptoWalletId = process.env.ETHERFUSE_CRYPTO_WALLET_ID ?? ''

	const missing: string[] = []
	if (!apiKey) missing.push('ETHERFUSE_API_KEY')

	if (!customerId) {
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
