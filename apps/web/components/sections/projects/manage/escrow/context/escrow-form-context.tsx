'use client'

import type { EscrowType } from '@trustless-work/escrow'
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'
import { DEFAULT_USDC_CONTRACT_ADDRESS } from '~/lib/constants/escrow'
import type { EscrowFormData, MilestoneItem } from '../types'

function genId(): string {
	return typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `m-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

interface EscrowFormContextValue {
	formData: EscrowFormData
	setField: <K extends keyof EscrowFormData>(
		field: K,
		value: EscrowFormData[K],
	) => void
	addMilestone: () => void
	removeMilestone: (id: string) => void
	updateMilestone: (index: number, patch: Partial<MilestoneItem>) => void
	convertMilestones: (type: EscrowType) => void
}

const EscrowFormContext = createContext<EscrowFormContextValue | undefined>(
	undefined,
)

interface EscrowFormProviderProps {
	children: React.ReactNode
	initialData: Pick<
		EscrowFormData,
		'title' | 'engagementId' | 'description' | 'selectedEscrowType'
	> & { walletAddress?: string | null }
}

export function EscrowFormProvider({
	children,
	initialData,
}: EscrowFormProviderProps) {
	const { walletAddress, selectedEscrowType, title, engagementId, description } =
		initialData

	const [formData, setFormData] = useState<EscrowFormData>(() => ({
		selectedEscrowType,
		title,
		engagementId,
		trustlineAddress: DEFAULT_USDC_CONTRACT_ADDRESS,
		approver: walletAddress ?? '',
		serviceProvider: walletAddress ?? '',
		releaseSigner: walletAddress ?? '',
		disputeResolver: walletAddress ?? '',
		platformAddress: walletAddress ?? '',
		receiver: walletAddress ?? '',
		platformFee: '',
		amount: '',
		receiverMemo: '',
		description,
		milestones:
			selectedEscrowType === 'multi-release'
				? [
						{
							id: genId(),
							description: 'Milestone 1',
							amount: '',
							receiver: walletAddress ?? '',
						},
					]
				: [{ id: genId(), description: 'Milestone 1' }],
	}))

	const setField = useCallback(
		<K extends keyof EscrowFormData>(field: K, value: EscrowFormData[K]) => {
			setFormData((prev) => ({ ...prev, [field]: value }))
		},
		[],
	)

	const addMilestone = useCallback(() => {
		setFormData((prev) => {
			const next =
				prev.selectedEscrowType === 'multi-release'
					? {
							id: genId(),
							description: `Milestone ${prev.milestones.length + 1}`,
							amount: '' as const,
							receiver: '',
						}
					: { id: genId(), description: `Milestone ${prev.milestones.length + 1}` }
			return { ...prev, milestones: [...prev.milestones, next] }
		})
	}, [])

	const removeMilestone = useCallback((id: string) => {
		setFormData((prev) => ({
			...prev,
			milestones: prev.milestones.filter((m) => m.id !== id),
		}))
	}, [])

	const updateMilestone = useCallback(
		(index: number, patch: Partial<MilestoneItem>) => {
			setFormData((prev) => ({
				...prev,
				milestones: prev.milestones.map((m, i) =>
					i === index ? { ...m, ...patch } : m,
				),
			}))
		},
		[],
	)

	const convertMilestones = useCallback((type: EscrowType) => {
		setFormData((prev) => ({
			...prev,
			selectedEscrowType: type,
			milestones: prev.milestones.map((m) => {
				if (type === 'multi-release') {
					if ('amount' in m && 'receiver' in m) return m
					return { ...m, amount: '' as const, receiver: '' }
				}
				// single-release: strip amount/receiver
				if ('amount' in m && 'receiver' in m) {
					// biome-ignore lint/suspicious/noExplicitAny: stripping extra keys
					const { amount: _a, receiver: _r, ...rest } = m as any
					return rest
				}
				return m
			}),
		}))
	}, [])

	const value = useMemo(
		() => ({
			formData,
			setField,
			addMilestone,
			removeMilestone,
			updateMilestone,
			convertMilestones,
		}),
		[
			formData,
			setField,
			addMilestone,
			removeMilestone,
			updateMilestone,
			convertMilestones,
		],
	)

	return (
		<EscrowFormContext.Provider value={value}>
			{children}
		</EscrowFormContext.Provider>
	)
}

export function useEscrowForm(): EscrowFormContextValue {
	const ctx = useContext(EscrowFormContext)
	if (!ctx)
		throw new Error('useEscrowForm must be used within EscrowFormProvider')
	return ctx
}
