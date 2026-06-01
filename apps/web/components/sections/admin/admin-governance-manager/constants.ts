import type { OptionRow } from './types'

export const EMPTY_ROW: OptionRow = {
	projectId: '',
	title: '',
	description: '',
	projectSlug: '',
}

export const STATUS_CONFIG = {
	upcoming: { label: 'Upcoming', className: 'border-blue-300 text-blue-600' },
	active: { label: 'Active', className: 'border-green-400 text-green-700' },
	ended: { label: 'Ended', className: 'border-gray-300 text-gray-500' },
} as const

export const GOVERNANCE_CONTRACT_ADDRESS =
	process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS ?? ''
