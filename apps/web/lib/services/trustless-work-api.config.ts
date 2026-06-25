import {
	getTrustlessWorkApiBaseUrl,
	getTrustlessWorkApiKey,
} from '~/lib/config/trustless-work.config'

export function getTrustlessWorkApiConfig(): {
	apiKey: string
	baseUrl: string
} {
	return {
		apiKey: getTrustlessWorkApiKey(),
		baseUrl: getTrustlessWorkApiBaseUrl(),
	}
}
