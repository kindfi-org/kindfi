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
	process.env.TRUSTLESS_WORK_API_URL || '',
	{
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.TRUSTLESS_WORK_API_KEY}`,
		},
	},
)
