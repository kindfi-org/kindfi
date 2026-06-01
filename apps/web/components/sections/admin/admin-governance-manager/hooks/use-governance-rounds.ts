import { useQuery } from '@tanstack/react-query'
import type { GovernanceRoundsResponse } from '../types'

export const useGovernanceRounds = () => {
	const query = useQuery<GovernanceRoundsResponse>({
		queryKey: ['governance-rounds'],
		queryFn: async () => {
			const res = await fetch('/api/governance/rounds')
			if (!res.ok) throw new Error('Failed to fetch rounds')
			return res.json()
		},
	})

	const rounds = query.data?.data ?? []
	const activeCount = rounds.filter(
		(r) => r.status === 'active' || r.status === 'upcoming',
	).length
	const endedCount = rounds.filter((r) => r.status === 'ended').length

	return {
		...query,
		rounds,
		activeCount,
		endedCount,
	}
}
