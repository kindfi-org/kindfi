import { TX_BAD_AUTH_MESSAGE } from './trustless-transaction-signing'

type TrustlessWorkErrorBody = {
	message?: string
	detail?: string
	title?: string
	details?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null

const formatValidationDetails = (details: unknown): string | undefined => {
	if (!isRecord(details)) return undefined

	const lines = Object.entries(details).flatMap(([field, messages]) => {
		if (!Array.isArray(messages)) return []
		return messages.map((message) => `${field}: ${String(message)}`)
	})

	return lines.length > 0 ? lines.join('; ') : undefined
}

const readTrustlessWorkErrorBody = (value: unknown): TrustlessWorkErrorBody | null => {
	if (!isRecord(value)) return null

	return {
		message: typeof value.message === 'string' ? value.message : undefined,
		detail: typeof value.detail === 'string' ? value.detail : undefined,
		title: typeof value.title === 'string' ? value.title : undefined,
		details: value.details,
	}
}

const formatTrustlessWorkErrorBody = (body: TrustlessWorkErrorBody | null): string | undefined => {
	if (!body) return undefined

	const validationDetails = formatValidationDetails(body.details)
	if (validationDetails) {
		return body.message ? `${body.message}: ${validationDetails}` : validationDetails
	}

	return body.message ?? body.detail ?? body.title
}

/** Extract a user-facing message from Trustless Work SDK / proxy errors. */
export const getTrustlessWorkApiErrorMessage = (error: unknown, fallback: string): string => {
	if (
		error instanceof Error &&
		error.message.trim().length > 0 &&
		!error.message.startsWith('Request failed with status code')
	) {
		return error.message
	}

	if (!isRecord(error)) return fallback

	const axiosResponse = isRecord(error.response) ? error.response : null
	const axiosData = axiosResponse
		? formatTrustlessWorkErrorBody(readTrustlessWorkErrorBody(axiosResponse.data))
		: undefined
	if (axiosData) {
		if (axiosData.includes('tx_bad_auth')) {
			return TX_BAD_AUTH_MESSAGE
		}
		return axiosData
	}

	const directData = formatTrustlessWorkErrorBody(readTrustlessWorkErrorBody(error.data))
	if (directData) return directData

	if (error instanceof Error && error.message.trim().length > 0) {
		return error.message
	}

	return fallback
}
