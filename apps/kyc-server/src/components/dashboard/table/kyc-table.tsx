/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: any*/
'use client'

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useEffect, useId, useMemo } from 'react'

import { Table } from '~/components/base/table'
import { KycTableSkeleton } from '~/components/dashboard/skeletons/kyc-table-skeleton'
import { KycTableBody } from '~/components/dashboard/table/kyc-table-body'
import { kycColumns } from '~/components/dashboard/table/kyc-table-columns'
import { KycTableFilters } from '~/components/dashboard/table/kyc-table-filters'
import { KycTableHeader } from '~/components/dashboard/table/kyc-table-header'
import { KycTablePagination } from '~/components/dashboard/table/kyc-table-pagination'
import { useKycTable } from '~/hooks/use-kyc-table'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycTableProps {
	data?: KycRecord[]
	isLoading?: boolean
}

export function KycTable({
	data: initialData,
	isLoading = false,
}: KycTableProps) {
	const {
		table,
		kycData,
		setKycData,
		filters: { statusFilter, verificationLevelFilter },
		setFilters: { setStatusFilter, setVerificationLevelFilter },
	} = useKycTable(initialData)

	const sortableId = useId()
	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {}),
	)

	const dataIds = useMemo<UniqueIdentifier[]>(
		() => kycData?.map(({ id }) => id) || [],
		[kycData],
	)

	useEffect(() => {
		if (initialData) {
			setKycData(initialData)
		}
	}, [initialData, setKycData])

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event
			if (active && over && active.id !== over.id) {
				setKycData((data) => {
					const oldIndex = dataIds.indexOf(active.id)
					const newIndex = dataIds.indexOf(over.id)
					return arrayMove(data, oldIndex, newIndex)
				})
			}
		},
		[dataIds, setKycData],
	)

	if (isLoading || !initialData) {
		return <KycTableSkeleton />
	}

	return (
		<div
			className="flex w-full flex-col justify-start gap-6"
			aria-label="KYC Records Table"
		>
			<KycTableFilters
				statusFilter={statusFilter}
				verificationLevelFilter={verificationLevelFilter}
				onStatusFilterChange={setStatusFilter}
				onVerificationLevelFilterChange={setVerificationLevelFilter}
				table={table}
			/>

			<div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
				<div className="overflow-hidden rounded-lg border">
					<DndContext
						collisionDetection={closestCenter}
						modifiers={[restrictToVerticalAxis]}
						onDragEnd={handleDragEnd}
						sensors={sensors}
						id={sortableId}
					>
						<Table>
							<KycTableHeader headerGroups={table.getHeaderGroups()} />
							<KycTableBody
								table={table}
								dataIds={dataIds}
								columnsLength={kycColumns.length}
							/>
						</Table>
					</DndContext>
				</div>

				<KycTablePagination table={table} />
			</div>
		</div>
	)
}
