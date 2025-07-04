import { appEnvConfig } from '@packages/lib'
import axios, { type CreateAxiosDefaults } from 'axios'

export const createHttpRequest = (
	baseURL: string,
	config?: Omit<CreateAxiosDefaults, 'baseURL'>,
) =>
	axios.create({
		baseURL,
		timeout: 60000, // 1 minute
		...(config || {}),
	})

export const httpEscrow = createHttpRequest(
	appEnvConfig('web').externalApis.trustlessWork.url,
	{
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${appEnvConfig('web').externalApis.trustlessWork.apiKey}`,
		},
	},
)
