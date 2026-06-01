import { useMutation } from '@tanstack/react-query'
import type {
	CreateOptionPayload,
	CreateRoundPayload,
} from '~/lib/governance/types'
import type { CreateRoundResult, OptionRow } from '../types'

interface CreateRoundForm {
	title: string
	description: string
	startsAt: string
	endsAt: string
	totalFundAmount: string
	fundCurrency: string
}

export const useCreateRound = (onSuccess: (data: CreateRoundResult) => void) => {
	return useMutation({
		mutationFn: async ({
			form,
			optionRows,
		}: {
			form: CreateRoundForm
			optionRows: OptionRow[]
		}): Promise<CreateRoundResult> => {
			const roundPayload: CreateRoundPayload = {
				title: form.title,
				description: form.description || undefined,
				startsAt: new Date(form.startsAt).toISOString(),
				endsAt: new Date(form.endsAt).toISOString(),
				totalFundAmount: Number(form.totalFundAmount) || 0,
				fundCurrency: form.fundCurrency,
			}

			const optionsPayload = optionRows
				.filter((r) => r.title.trim())
				.map(
					(r): Omit<CreateOptionPayload, 'roundId'> => ({
						title: r.title,
						description: r.description || undefined,
						projectSlug: r.projectSlug || undefined,
					}),
				)

			const res = await fetch('/api/governance/rounds', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ round: roundPayload, options: optionsPayload }),
			})

			const json = await res.json()
			if (!res.ok) throw new Error(json.error ?? 'Failed to create round')
			return json as CreateRoundResult
		},
		onSuccess,
	})
}

export type { CreateRoundForm }
