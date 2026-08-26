import * as z from 'zod'

export const buildFormSchema = (minInvestment: number) =>
	z.object({
		investmentAmount: z.coerce
			.number({ error: 'Investment amount must be a valid number' })
			.positive('Investment amount must be greater than zero')
			.min(minInvestment, `Minimum investment is $${minInvestment}`),
	})

export type FormValues = z.infer<ReturnType<typeof buildFormSchema>>
