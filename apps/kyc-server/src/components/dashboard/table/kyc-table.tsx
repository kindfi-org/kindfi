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
import { KycTableFilters } from '~/components/dashboard/table/kyc-table-filters'
import { KycTableHeader } from '~/components/dashboard/table/kyc-table-header'
import { KycTablePagination } from '~/components/dashboard/table/kyc-table-pagination'
import { useKycTable } from '~/hooks/use-kyc-table'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycTableProps {
	data?: KycRecord[]
	isLoading?: boolean
	onStatusUpdate?: () => void
	onReview?: (userId: string) => void
	isConnected?: boolean
}

export function KycTable({
	data: initialData,
	isLoading = false,
	onStatusUpdate,
	onReview,
	isConnected = false,
}: KycTableProps) {
	const {
		table,
		kycData,
		setKycData,
		filters: { statusFilter, verificationLevelFilter },
		setFilters: { setStatusFilter, setVerificationLevelFilter },
	} = useKycTable(initialData, { onStatusUpdate, onReview })

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
				{isConnected && (
					<div className="flex items-center gap-1">
						<div className="size-2 bg-green-500 rounded-full animate-pulse" />
						<span className="text-xs text-green-600 font-medium">Live</span>
					</div>
				)}
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
								columnsLength={table.getVisibleLeafColumns().length}
							/>
						</Table>
					</DndContext>
				</div>

				<KycTablePagination table={table} />
			</div>
		</div>
	)
}
