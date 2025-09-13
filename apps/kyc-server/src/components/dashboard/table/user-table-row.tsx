import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Row } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

import { TableCell, TableRow } from '~/components/base/table'

interface UserTableRowProps<TData> {
	row: Row<TData>
}

export function UserTableRow<TData>({ row }: UserTableRowProps<TData>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: row.id,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.8 : 1,
	}

	return (
		<TableRow
			ref={setNodeRef}
			style={style}
			{...attributes}
			data-state={row.getIsSelected() && 'selected'}
			className={`
				${isDragging ? 'bg-muted/50' : ''}
				${row.getIsSelected() ? 'bg-muted/30' : 'hover:bg-muted/20'}
				transition-colors
			`}
		>
			{row.getVisibleCells().map((cell, index) => {
				const cellProps = index === 0 ? { ...listeners } : {}

				return (
					<TableCell key={cell.id} {...cellProps}>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</TableCell>
				)
			})}
		</TableRow>
	)
}
