import type { UniqueIdentifier } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Table } from '@tanstack/react-table'

import { TableBody, TableCell, TableRow } from '~/components/base/table'
import { KycTableRow } from '~/components/dashboard/table/kyc-table-row'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycTableBodyProps {
	table: Table<KycRecord>
	dataIds: UniqueIdentifier[]
	columnsLength: number
}

export function KycTableBody({
	table,
	dataIds,
	columnsLength,
}: KycTableBodyProps) {
	return (
		<TableBody className="**:data-[slot=table-cell]:first:w-8">
			{table.getRowModel().rows?.length ? (
				<SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
					{table.getRowModel().rows.map((row) => (
						<KycTableRow key={row.id} row={row} />
					))}
				</SortableContext>
			) : (
				<TableRow>
					<TableCell colSpan={columnsLength} className="h-24 text-center">
						No KYC records found.
					</TableCell>
				</TableRow>
			)}
		</TableBody>
	)
}
