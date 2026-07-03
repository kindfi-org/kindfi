type TrustlessWorkErrorBody = {
	message?: string
	detail?: string
	title?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null

const readTrustlessWorkErrorBody = (value: unknown): TrustlessWorkErrorBody | null => {
	if (!isRecord(value)) return null

	return {
		message: typeof value.message === 'string' ? value.message : undefined,
		detail: typeof value.detail === 'string' ? value.detail : undefined,
		title: typeof value.title === 'string' ? value.title : undefined,
	}
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
	const axiosData = axiosResponse ? readTrustlessWorkErrorBody(axiosResponse.data) : null
	if (axiosData?.message) return axiosData.message
	if (axiosData?.detail) return axiosData.detail

	const directData = readTrustlessWorkErrorBody(error.data)
	if (directData?.message) return directData.message
	if (directData?.detail) return directData.detail

	if (error instanceof Error && error.message.trim().length > 0) {
		return error.message
	}

	return fallback
}
