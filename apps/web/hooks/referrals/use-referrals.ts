'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Referral {
	id: string
	referrer_id: string
	referred_id: string
	status: 'pending' | 'onboarded' | 'first_donation' | 'active'
	created_at: string
	onboarded_at: string | null
	first_donation_at: string | null
	total_donations: number
}

export interface ReferrerStats {
	total_referrals: number
	active_referrals: number
	total_reward_points: number
}

export interface ReferralProfile {
	user_id: string
	referral_code: string
	stellar_address: string | null
	activated_at: string
	on_chain_ready: boolean
}

export interface ReferralsData {
	referrals: Referral[]
	statistics: ReferrerStats
	referred_by: string | null
	is_activated: boolean
	referral_code: string | null
	referral_profile: ReferralProfile | null
}

const REFERRALS_QUERY_KEY = ['referrals'] as const

const fetchReferrals = async (): Promise<ReferralsData> => {
	const response = await fetch('/api/referrals')
	if (!response.ok) {
		throw new Error('Failed to fetch referrals')
	}
	return response.json()
}

export const useReferrals = () => {
	const queryClient = useQueryClient()

	const query = useQuery<ReferralsData>({
		queryKey: REFERRALS_QUERY_KEY,
		queryFn: fetchReferrals,
		refetchInterval: 30000,
	})

	const activateMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch('/api/referrals/activate', { method: 'POST' })
			const data = await response.json()
			if (!response.ok) {
				throw new Error(data.error || 'Failed to activate referral code')
			}
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: REFERRALS_QUERY_KEY })
		},
	})

	const applyMutation = useMutation({
		mutationFn: async (code: string) => {
			const response = await fetch('/api/referrals/apply', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code }),
			})
			const data = await response.json()
			if (!response.ok) {
				throw new Error(data.error || 'Failed to apply referral code')
			}
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: REFERRALS_QUERY_KEY })
		},
	})

	return {
		...query,
		activateReferral: activateMutation.mutateAsync,
		isActivating: activateMutation.isPending,
		activateError: activateMutation.error,
		applyReferralCode: applyMutation.mutateAsync,
		isApplying: applyMutation.isPending,
		applyError: applyMutation.error,
	}
}
