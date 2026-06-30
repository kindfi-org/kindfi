import { useMemo } from 'react'
import { isExternalStellarWalletAddress } from '~/lib/utils/escrow/trustless-signer'
import type { EscrowFormData } from '../types'

export type EscrowWizardStep = 'type' | 'details' | 'roles' | 'milestones' | 'review'

export const ESCROW_WIZARD_STEPS: {
	id: EscrowWizardStep
	label: string
	shortLabel: string
	description: string
}[] = [
	{
		id: 'type',
		label: 'Escrow Type',
		shortLabel: 'Type',
		description: 'Choose how funds are released when milestones are approved.',
	},
	{
		id: 'details',
		label: 'Project Details',
		shortLabel: 'Details',
		description: 'Name your escrow and set the asset and funding amount.',
	},
	{
		id: 'roles',
		label: 'Roles',
		shortLabel: 'Roles',
		description: 'Assign Stellar wallet addresses to each escrow role.',
	},
	{
		id: 'milestones',
		label: 'Milestones',
		shortLabel: 'Milestones',
		description: 'Define deliverables and, for multi-release, per-milestone payouts.',
	},
	{
		id: 'review',
		label: 'Review',
		shortLabel: 'Review',
		description: 'Confirm everything before deploying on-chain.',
	},
]

export type StepValidation = {
	valid: boolean
	issues: string[]
}

const isValidAddress = (value: string) => isExternalStellarWalletAddress(value.trim())

function validateDetails(formData: EscrowFormData, projectId: string): string[] {
	const issues: string[] = []

	if (!formData.title.trim()) issues.push('Add an escrow title.')
	if (!(formData.engagementId || `project-${projectId}`).trim())
		issues.push('Add an engagement identifier.')
	if (!formData.trustlineAddress.trim()) issues.push('Add a trustline (asset) address.')
	if (!formData.description.trim()) issues.push('Add an escrow description.')

	if (formData.selectedEscrowType === 'single-release') {
		if (typeof formData.amount !== 'number' || !Number.isFinite(formData.amount))
			issues.push('Set a valid escrow amount for single-release.')
	}

	return issues
}

function validateRoles(formData: EscrowFormData): string[] {
	const issues: string[] = []
	const roleChecks: [string, string][] = [
		['Approver', formData.approver],
		['Service Provider', formData.serviceProvider],
		['Release Signer', formData.releaseSigner],
		['Dispute Resolver', formData.disputeResolver],
		['Platform Address', formData.platformAddress],
	]

	for (const [label, value] of roleChecks) {
		if (!isValidAddress(value)) issues.push(`Enter a valid G-address for ${label}.`)
	}

	if (formData.selectedEscrowType === 'single-release' && !isValidAddress(formData.receiver)) {
		issues.push('Enter a valid G-address for Receiver.')
	}

	return issues
}

function validateMilestones(formData: EscrowFormData): string[] {
	const issues: string[] = []
	const described = formData.milestones.filter((m) => m.description.trim().length > 0)

	if (described.length === 0) issues.push('Add at least one milestone with a description.')

	if (formData.selectedEscrowType === 'multi-release') {
		for (const [index, milestone] of formData.milestones.entries()) {
			if (!milestone.description.trim()) continue

			if (!('amount' in milestone && 'receiver' in milestone)) {
				issues.push(`Milestone ${index + 1} is missing amount or receiver.`)
				continue
			}

			if (
				typeof milestone.amount !== 'number' ||
				!Number.isFinite(milestone.amount) ||
				milestone.amount <= 0
			) {
				issues.push(`Milestone ${index + 1} needs a positive amount.`)
			}

			if (!isValidAddress(milestone.receiver)) {
				issues.push(`Milestone ${index + 1} needs a valid receiver G-address.`)
			}
		}
	}

	return issues
}

export function useEscrowStepValidation(formData: EscrowFormData, projectId: string) {
	return useMemo(() => {
		const detailsIssues = validateDetails(formData, projectId)
		const rolesIssues = validateRoles(formData)
		const milestonesIssues = validateMilestones(formData)

		const steps: Record<EscrowWizardStep, StepValidation> = {
			type: { valid: true, issues: [] },
			details: { valid: detailsIssues.length === 0, issues: detailsIssues },
			roles: { valid: rolesIssues.length === 0, issues: rolesIssues },
			milestones: { valid: milestonesIssues.length === 0, issues: milestonesIssues },
			review: {
				valid:
					detailsIssues.length === 0 && rolesIssues.length === 0 && milestonesIssues.length === 0,
				issues: [...detailsIssues, ...rolesIssues, ...milestonesIssues],
			},
		}

		return {
			steps,
			isFullyValid: steps.review.valid,
		}
	}, [formData, projectId])
}
