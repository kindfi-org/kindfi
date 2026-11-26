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
	// Payload staged for explicit confirmation before anything is submitted.
	const [pendingPayload, setPendingPayload] = useState<AdminGamificationTriggerInput | null>(null)

	const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
	const [referralAction, setReferralAction] = useState<
		'create_referral' | 'mark_onboarded' | 'record_donation'
	>('create_referral')
	const [questId, setQuestId] = useState('0')
	const [progressValue, setProgressValue] = useState('1')
	const [targetUserAddress, setTargetUserAddress] = useState('')
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
			setPendingPayload(null)
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
			setPendingPayload(null)
			const message = error instanceof Error ? error.message : 'Request failed'
			setLastResult({ success: false, error: message })
			toast.error('Request failed', { description: message })
		},
	})

	const resolveTargetAddress = (connectedAddress: string | null): string | null => {
		const trimmed = targetUserAddress.trim()
		if (trimmed) return trimmed
		return connectedAddress
	}

	// Stages the payload for confirmation instead of submitting directly —
	// contract calls only fire after an explicit confirm.
	const handleSubmit = (
		payload: AdminGamificationTriggerInput,
		connectedAddress: string | null,
	) => {
		if (
			payload.module === 'quest' ||
			payload.module === 'reputation' ||
			payload.module === 'streak'
		) {
			const targetAddress = resolveTargetAddress(connectedAddress)
			if (!targetAddress) {
				toast.error('Enter a target Stellar G-address or connect a wallet')
				return
			}
			setPendingPayload({ ...payload, userAddress: targetAddress })
			return
		}

		if (!connectedAddress) {
			toast.error('A Stellar wallet address is required')
			return
		}

		setPendingPayload(payload)
	}

	const confirmPending = () => {
		if (!pendingPayload || mutation.isPending) return
		setLastResult(null)
		mutation.mutate(pendingPayload)
	}

	const cancelPending = () => {
		if (mutation.isPending) return
		setPendingPayload(null)
	}

	const canSubmitWithAddress = (connectedAddress: string | null) =>
		Boolean(resolveTargetAddress(connectedAddress)) && !mutation.isPending

	const canSubmit = Boolean(address) && !mutation.isPending

	return {
		activeModule,
		setActiveModule,
		lastResult,
		canSubmit,
		isPending: mutation.isPending,
		handleSubmit,
		pendingPayload,
		confirmPending,
		cancelPending,

		period,
		setPeriod,
		referralAction,
		setReferralAction,
		questId,
		setQuestId,
		progressValue,
		setProgressValue,
		targetUserAddress,
		setTargetUserAddress,
		canSubmitWithAddress,
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
