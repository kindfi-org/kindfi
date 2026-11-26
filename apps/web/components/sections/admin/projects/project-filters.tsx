'use client'

import { useId } from 'react'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import type { AdminProjectFilterOptions } from '~/lib/queries/admin/get-admin-projects'
import {
	ESCROW_STATE_FILTERS,
	PROJECT_SORT_OPTIONS,
	PROJECT_STATUS_FILTERS,
} from '~/lib/validators/admin-list-params'

const ALL = 'all'

const STATUS_LABELS: Record<string, string> = {
	draft: 'Draft',
	review: 'In review',
	active: 'Active',
	paused: 'Paused',
	funded: 'Funded',
	rejected: 'Rejected',
}

const SORT_LABELS: Record<(typeof PROJECT_SORT_OPTIONS)[number], string> = {
	newest: 'Newest first',
	oldest: 'Oldest first',
	funding: 'Most funded',
	target: 'Highest target',
	status: 'By status',
}

interface FilterSelectProps {
	label: string
	value: string
	onChange: (value: string | undefined) => void
	options: Array<{ value: string; label: string }>
	allLabel: string
}

function FilterSelect({ label, value, onChange, options, allLabel }: FilterSelectProps) {
	const id = useId()
	return (
		<div className="flex items-center gap-1.5">
			<Label htmlFor={id} className="sr-only">
				{label}
			</Label>
			<Select
				value={value || ALL}
				onValueChange={(next) => onChange(next === ALL ? undefined : next)}
			>
				<SelectTrigger id={id} className="h-9 w-auto min-w-32 gap-1" aria-label={label}>
					<SelectValue placeholder={allLabel} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL}>{allLabel}</SelectItem>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

interface ProjectFiltersProps {
	values: {
		status?: string
		escrow?: string
		category?: string
		foundation?: string
		devOnly?: string
		sort: string
	}
	options: AdminProjectFilterOptions | null
	onChange: (key: string, value: string | undefined) => void
}

export function ProjectFilters({ values, options, onChange }: ProjectFiltersProps) {
	return (
		<>
			<FilterSelect
				label="Filter by status"
				allLabel="All statuses"
				value={values.status ?? ''}
				onChange={(value) => onChange('status', value)}
				options={PROJECT_STATUS_FILTERS.map((status) => ({
					value: status,
					label: STATUS_LABELS[status] ?? status,
				}))}
			/>
			<FilterSelect
				label="Filter by escrow"
				allLabel="Any escrow state"
				value={values.escrow ?? ''}
				onChange={(value) => onChange('escrow', value)}
				options={[
					{ value: 'none', label: 'No escrow' },
					{ value: 'any', label: 'Has escrow' },
					...ESCROW_STATE_FILTERS.map((state) => ({ value: state, label: `Escrow ${state}` })),
				]}
			/>
			<FilterSelect
				label="Filter by category"
				allLabel="All categories"
				value={values.category ?? ''}
				onChange={(value) => onChange('category', value)}
				options={(options?.categories ?? [])
					.filter((category) => category.slug)
					.map((category) => ({ value: category.slug as string, label: category.name }))}
			/>
			<FilterSelect
				label="Filter by foundation"
				allLabel="All foundations"
				value={values.foundation ?? ''}
				onChange={(value) => onChange('foundation', value)}
				options={(options?.foundations ?? []).map((foundation) => ({
					value: foundation.slug,
					label: foundation.name,
				}))}
			/>
			<FilterSelect
				label="Filter by visibility"
				allLabel="All projects"
				value={values.devOnly ?? ''}
				onChange={(value) => onChange('devOnly', value)}
				options={[
					{ value: 'true', label: 'Development only' },
					{ value: 'false', label: 'Public projects' },
				]}
			/>
			<FilterSelect
				label="Sort projects"
				allLabel="Newest first"
				value={values.sort === 'newest' ? '' : values.sort}
				onChange={(value) => onChange('sort', value ?? 'newest')}
				options={PROJECT_SORT_OPTIONS.filter((sort) => sort !== 'newest').map((sort) => ({
					value: sort,
					label: SORT_LABELS[sort],
				}))}
			/>
		</>
	)
}
