import type { GovernanceRound } from '~/lib/governance/types'

export interface ProjectSummary {
	id: string
	title: string
	slug: string
	image_url: string | null
	description: string | null
	category: { name: string } | null
}

export interface OptionRow {
	projectId: string
	title: string
	description: string
	projectSlug: string
}

export interface CreateRoundResult {
	success: boolean
	onChain: boolean
	data: GovernanceRound & { contract_round_id: number | null }
}

export interface ProjectsListResponse {
	success: boolean
	data: ProjectSummary[]
}

export interface GovernanceRoundsResponse {
	success: boolean
	data: GovernanceRound[]
}
