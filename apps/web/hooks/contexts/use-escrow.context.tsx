'use client'

import type {
	ApproveMilestonePayload,
	ChangeMilestoneStatusPayload,
	EscrowRequestResponse,
	EscrowType,
	FundEscrowPayload,
	GetBalanceParams,
	GetEscrowBalancesResponse,
	GetEscrowFromIndexerByContractIdsParams,
	GetEscrowsFromIndexerByRoleParams,
	GetEscrowsFromIndexerBySignerParams,
	GetEscrowsFromIndexerResponse,
	InitializeMultiReleaseEscrowPayload,
	InitializeMultiReleaseEscrowResponse,
	InitializeSingleReleaseEscrowPayload,
	InitializeSingleReleaseEscrowResponse,
	MultiReleaseReleaseFundsPayload,
	MultiReleaseResolveDisputePayload,
	MultiReleaseStartDisputePayload,
	SendTransactionResponse,
	SingleReleaseReleaseFundsPayload,
	SingleReleaseResolveDisputePayload,
	SingleReleaseStartDisputePayload,
	UpdateMultiReleaseEscrowPayload,
	UpdateSingleReleaseEscrowPayload,
} from '@trustless-work/escrow'
import {
	useApproveMilestone,
	useChangeMilestoneStatus,
	useFundEscrow,
	useGetEscrowFromIndexerByContractIds,
	useGetEscrowsFromIndexerByRole,
	useGetEscrowsFromIndexerBySigner,
	useGetMultipleEscrowBalances,
	useInitializeEscrow,
	useReleaseFunds,
	useResolveDispute,
	useSendTransaction,
	useStartDispute,
	useUpdateEscrow,
} from '@trustless-work/escrow'
import { createContext, useContext, useMemo } from 'react'

interface EscrowActionsContext {
	// initialize
	deployEscrow: (
		payload:
			| InitializeSingleReleaseEscrowPayload
			| InitializeMultiReleaseEscrowPayload,
		type: EscrowType,
	) => Promise<EscrowRequestResponse>

	// send tx
	sendTransaction: (
		signedXdr: string,
	) => Promise<
		| SendTransactionResponse
		| InitializeSingleReleaseEscrowResponse
		| InitializeMultiReleaseEscrowResponse
	>

	// get by contract ids
	getEscrowByContractIds: (
		params: GetEscrowFromIndexerByContractIdsParams,
	) => Promise<GetEscrowsFromIndexerResponse>

	// update
	updateEscrow: (
		payload: UpdateSingleReleaseEscrowPayload | UpdateMultiReleaseEscrowPayload,
		type: EscrowType,
	) => Promise<EscrowRequestResponse>

	// start/resolve dispute
	startDispute: (
		payload: SingleReleaseStartDisputePayload | MultiReleaseStartDisputePayload,
		type: EscrowType,
	) => Promise<EscrowRequestResponse>
	resolveDispute: (
		payload:
			| SingleReleaseResolveDisputePayload
			| MultiReleaseResolveDisputePayload,
		type: EscrowType,
	) => Promise<EscrowRequestResponse>

	// balances
	getMultipleBalances: (
		payload: GetBalanceParams,
		type: EscrowType,
	) => Promise<GetEscrowBalancesResponse[]>

	// funds
	releaseFunds: (
		payload: SingleReleaseReleaseFundsPayload | MultiReleaseReleaseFundsPayload,
		type: EscrowType,
	) => Promise<EscrowRequestResponse>
	fundEscrow: (
		payload: FundEscrowPayload,
		type: EscrowType,
	) => Promise<EscrowRequestResponse>

	// milestones
	changeMilestoneStatus: (
		payload: ChangeMilestoneStatusPayload,
		type: EscrowType,
	) => Promise<EscrowRequestResponse>
	approveMilestone: (
		payload: ApproveMilestonePayload,
		type: EscrowType,
	) => Promise<EscrowRequestResponse>

	// indexer queries
	getEscrowsBySigner: (
		params: GetEscrowsFromIndexerBySignerParams,
	) => Promise<GetEscrowsFromIndexerResponse[]>
	getEscrowsByRole: (
		params: GetEscrowsFromIndexerByRoleParams,
	) => Promise<GetEscrowsFromIndexerResponse[]>
}

const EscrowContext = createContext<EscrowActionsContext | undefined>(undefined)

export function EscrowProvider({ children }: { children: React.ReactNode }) {
	const { deployEscrow } = useInitializeEscrow()
	const { sendTransaction } = useSendTransaction()
	const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds()
	const { updateEscrow } = useUpdateEscrow()
	const { startDispute } = useStartDispute()
	const { resolveDispute } = useResolveDispute()
	const { getMultipleBalances } = useGetMultipleEscrowBalances()
	const { releaseFunds } = useReleaseFunds()
	const { fundEscrow } = useFundEscrow()
	const { changeMilestoneStatus } = useChangeMilestoneStatus()
	const { approveMilestone } = useApproveMilestone()
	const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner()
	const { getEscrowsByRole } = useGetEscrowsFromIndexerByRole()

	const value: EscrowActionsContext = useMemo(
		() => ({
			deployEscrow,
			sendTransaction,
			getEscrowByContractIds,
			updateEscrow,
			startDispute,
			resolveDispute,
			getMultipleBalances,
			releaseFunds,
			fundEscrow,
			changeMilestoneStatus,
			approveMilestone,
			getEscrowsBySigner,
			getEscrowsByRole,
		}),
		[
			deployEscrow,
			sendTransaction,
			getEscrowByContractIds,
			updateEscrow,
			startDispute,
			resolveDispute,
			getMultipleBalances,
			releaseFunds,
			fundEscrow,
			changeMilestoneStatus,
			approveMilestone,
			getEscrowsBySigner,
			getEscrowsByRole,
		],
	)

	return (
		<EscrowContext.Provider value={value}>{children}</EscrowContext.Provider>
	)
}

export function useEscrow() {
	const ctx = useContext(EscrowContext)
	if (!ctx) throw new Error('useEscrow must be used within EscrowProvider')
	return ctx
}

export type { EscrowActionsContext }
