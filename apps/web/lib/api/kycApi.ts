import axios, { type AxiosResponse } from 'axios'

const KYC_API_BASE_URL =
	process.env.NEXT_PUBLIC_KYC_API_BASE_URL || 'http://localhost:3001'

const kycApiClient = axios.create({
	baseURL: KYC_API_BASE_URL,
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' },
})

type KycData = Record<string, unknown> | unknown

const transformData = (data: KycData): KycData => {
	if (data && typeof data === 'object' && !Array.isArray(data)) {
		const transformed: Record<string, unknown> = {}
		for (const key in data) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				const value = (data as Record<string, unknown>)[key]
				if (value instanceof Date) {
					transformed[key] = value.toISOString().split('T')[0]
				} else if (value && typeof value === 'object') {
					transformed[key] = transformData(value)
				} else {
					transformed[key] = value
				}
			}
		}
		return transformed
	}

	return data
}

export const submitKycStep = async <T = unknown>(
	step: number,
	data: KycData,
	retries = 3,
): Promise<T> => {
	const url = `/api/kyc/step${step}`
	const transformedData = transformData(data)
	console.log(`Sending request to: ${KYC_API_BASE_URL}${url}`)
	console.log('Transformed Data:', transformedData)

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			console.log(`Attempt ${attempt} for step ${step}:`, transformedData)
			const response: AxiosResponse<T> = await kycApiClient.post(
				url,
				transformedData,
			)
			return response.data
		} catch (error) {
			console.error(`Attempt ${attempt} failed for step ${step}:`, error)
			if (attempt === retries) {
				throw new Error(
					`Error sending step ${step} data after ${retries} attempts: ${error}`,
				)
			}
			await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
		}
	}
	throw new Error(`Failed to send step ${step} data`) 
}

export const submitFinalKyc = async <T = unknown>(
	kycData: KycData,
): Promise<T> => {
	try {
		const transformedKycData = transformData(kycData)
		const response: AxiosResponse<T> = await kycApiClient.post(
			'/submit',
			transformedKycData,
		)
		return response.data
	} catch (error) {
		throw new Error(`Error sending final KYC: ${error}`)
	}
}
