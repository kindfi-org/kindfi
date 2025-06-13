import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Row } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

import { TableCell, TableRow } from '~/components/base/table'
import type { KycRecord } from '~/lib/types/dashboard'
import { cn } from '~/lib/utils'

interface KycTableRowProps {
	row: Row<KycRecord>
	className?: string
}

export function KycTableRow({ row, className }: KycTableRowProps) {
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: row.original.id,
	})

	return (
		<TableRow
			data-state={row.getIsSelected() && 'selected'}
			data-dragging={isDragging}
			ref={setNodeRef}
			className={cn(
				'relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80',
				className,
			)}
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	)
}
