import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import type { AdminGamificationTriggerInput } from '~/lib/schemas/admin-gamification-trigger.schemas'
import type { TriggerResponse } from '../types'

async function triggerContract(payload: AdminGamificationTriggerInput): Promise<TriggerResponse> {
	const response = await fetch('/api/admin/gamification/trigger', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
	const json = (await response.json()) as TriggerResponse
	if (!response.ok && !json.error) {
		throw new Error(`Request failed (${response.status})`)
	}
	return json
}

export function useAdminGamificationTriggerForm(address: string | null) {
	const [activeModule, setActiveModule] = useState<string>('streak')
	const [lastResult, setLastResult] = useState<TriggerResponse | null>(null)

	const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
	const [referralAction, setReferralAction] = useState<
		'create_referral' | 'mark_onboarded' | 'record_donation'
	>('create_referral')
	const [questId, setQuestId] = useState('0')
	const [progressValue, setProgressValue] = useState('1')
	const [nftAction, setNftAction] = useState<'mint' | 'update_metadata'>('mint')
	const [tokenId, setTokenId] = useState('0')
	const [nftName, setNftName] = useState('KindFi Impact NFT (Admin Test)')
	const [eventType, setEventType] = useState('0')
	const [customPoints, setCustomPoints] = useState('')
	const [roundId, setRoundId] = useState('0')
	const [optionId, setOptionId] = useState('0')
	const [voteType, setVoteType] = useState<'up' | 'down'>('up')
	const [tier, setTier] = useState<'bronze' | 'silver' | 'gold' | 'diamond'>('bronze')

	const mutation = useMutation({
		mutationFn: triggerContract,
		onSuccess: (data) => {
			setLastResult(data)
			if (data.success) {
				toast.success('On-chain trigger submitted', {
					description: data.txHash
						? `Hash: ${data.txHash.slice(0, 12)}…`
						: 'Check the result panel for details.',
				})
			} else {
				toast.error('On-chain trigger failed', {
					description: data.error || 'Unknown error',
				})
			}
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : 'Request failed'
			setLastResult({ success: false, error: message })
			toast.error('Request failed', { description: message })
		},
	})

	const handleSubmit = (payload: AdminGamificationTriggerInput) => {
		if (!address) {
			toast.error('Connect a Stellar wallet first')
			return
		}
		setLastResult(null)
		mutation.mutate(payload)
	}

	const canSubmit = Boolean(address) && !mutation.isPending

	return {
		activeModule,
		setActiveModule,
		lastResult,
		canSubmit,
		isPending: mutation.isPending,
		handleSubmit,

		period,
		setPeriod,
		referralAction,
		setReferralAction,
		questId,
		setQuestId,
		progressValue,
		setProgressValue,
		nftAction,
		setNftAction,
		tokenId,
		setTokenId,
		nftName,
		setNftName,
		eventType,
		setEventType,
		customPoints,
		setCustomPoints,
		roundId,
		setRoundId,
		optionId,
		setOptionId,
		voteType,
		setVoteType,
		tier,
		setTier,
	}
}
