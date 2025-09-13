import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Table } from '@tanstack/react-table'

import { TableBody, TableCell, TableRow } from '~/components/base/table'
import { UserTableRow } from './user-table-row'

interface UserTableBodyProps<TData> {
	table: Table<TData>
	columnsLength: number
}

export function UserTableBody<TData>({
	table,
	columnsLength,
}: UserTableBodyProps<TData>) {
	const rows = table.getRowModel().rows

	if (rows.length === 0) {
		return (
			<TableBody>
				<TableRow>
					<TableCell
						colSpan={columnsLength}
						className="h-24 text-center text-muted-foreground"
					>
						<div className="space-y-2">
							<p className="text-lg font-medium">No users found</p>
							<p className="text-sm">
								Try adjusting your search criteria or filters to find users.
							</p>
						</div>
					</TableCell>
				</TableRow>
			</TableBody>
		)
	}

	return (
		<SortableContext items={rows.map(row => row.id)} strategy={verticalListSortingStrategy}>
			<TableBody>
				{rows.map((row) => (
					<UserTableRow key={row.id} row={row} />
				))}
			</TableBody>
		</SortableContext>
	)
}
