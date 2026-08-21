import type { EscrowType } from '@trustless-work/escrow'
import { useCallback, useMemo } from 'react'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useEscrowBalance } from '~/hooks/escrow/use-escrow-balance'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import {
	isProjectAcceptingDonations,
	isProjectCampaignComplete,
	type ProjectStatus,
} from '~/lib/projects/project-status'
import { resolveEscrowType } from '~/lib/utils/escrow/resolve-escrow-type'
import {
	calculateReleasedAmountFromEscrow,
	calculateReleasedProgressPercent,
	resolveDisplayReleasedAmount,
} from '~/lib/utils/projects/milestone-funding'

/** Delay balance refetch after a donation so fund-escrow is not competing with reads. */
const POST_DONATION_BALANCE_REFETCH_DELAY_MS = 2_500

export function useProjectSidebarEscrowState(project: ProjectDetail) {
	const { getEscrowByContractIds } = useEscrow()

	const { escrowData, isLoading: isEscrowDataLoading } = useEscrowData({
		escrowContractAddress: project.escrowContractAddress || '',
		escrowType: project.escrowType,
	})

	const hasEscrow = Boolean(project.escrowContractAddress)
	const projectStatus = (project.status ?? 'draft') as ProjectStatus
	const isCampaignComplete = isProjectCampaignComplete(projectStatus)
	const isAcceptingDonations = isProjectAcceptingDonations(projectStatus)

	const effectiveEscrowType = resolveEscrowType({
		indexerEscrow: escrowData,
		projectEscrowType: project.escrowType,
	})

	const {
		balance: onChainRaised,
		isLoading: isFetchingBalance,
		refetch: refetchEscrowBalance,
	} = useEscrowBalance({
		escrowContractAddress: project.escrowContractAddress ?? undefined,
		escrowType: effectiveEscrowType ?? project.escrowType,
	})

	const isDonationReady = Boolean(hasEscrow && effectiveEscrowType && !isEscrowDataLoading)

	const effectiveRaised = onChainRaised ?? project.raised

	const progressPercentage = useMemo(() => {
		return Math.min(Math.round((effectiveRaised / project.goal) * 100), 100)
	}, [effectiveRaised, project.goal])

	const isGoalReached = useMemo(
		() => hasEscrow && project.goal > 0 && effectiveRaised >= project.goal,
		[hasEscrow, project.goal, effectiveRaised],
	)

	const displayReleased = useMemo(
		() =>
			resolveDisplayReleasedAmount({
				dbMilestones: project.milestones,
				escrowContractAddress: project.escrowContractAddress,
				onChainReleasedAmount: escrowData ? calculateReleasedAmountFromEscrow(escrowData) : null,
				isLoadingOnChain: hasEscrow && isEscrowDataLoading && !escrowData,
			}),
		[escrowData, hasEscrow, isEscrowDataLoading, project.escrowContractAddress, project.milestones],
	)

	const releasedProgressPercent = useMemo(
		() =>
			displayReleased === null
				? null
				: calculateReleasedProgressPercent(displayReleased, project.goal),
		[displayReleased, project.goal],
	)

	const resolveEscrowTypeForFunding = useCallback(async (): Promise<EscrowType> => {
		const knownType = resolveEscrowType({
			indexerEscrow: escrowData,
			projectEscrowType: project.escrowType,
		})
		if (knownType) return knownType

		if (!project.escrowContractAddress) {
			throw new Error('Escrow is not configured for this project')
		}

		const response = await getEscrowByContractIds({
			contractIds: [project.escrowContractAddress],
			validateOnChain: false,
		})
		const indexerEscrow = Array.isArray(response) ? response[0] : response
		if (indexerEscrow?.type) return indexerEscrow.type

		throw new Error('Unable to determine escrow configuration')
	}, [escrowData, getEscrowByContractIds, project.escrowContractAddress, project.escrowType])

	const fetchEscrowBalance = useCallback(async () => {
		await new Promise((resolve) => setTimeout(resolve, POST_DONATION_BALANCE_REFETCH_DELAY_MS))
		await refetchEscrowBalance()
	}, [refetchEscrowBalance])

	return {
		escrowData,
		hasEscrow,
		isCampaignComplete,
		isAcceptingDonations,
		effectiveEscrowType,
		isDonationReady,
		isEscrowDataLoading,
		onChainRaised,
		isFetchingBalance,
		effectiveRaised,
		progressPercentage,
		isGoalReached,
		displayReleased,
		releasedProgressPercent,
		fetchEscrowBalance,
		resolveEscrowTypeForFunding,
	}
}
