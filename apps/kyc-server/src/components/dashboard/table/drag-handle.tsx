import { useSortable } from '@dnd-kit/sortable'
import { GripVerticalIcon } from 'lucide-react'
import { Button } from '~/components/base/button'

interface DragHandleProps {
	id: number
	className?: string
}

export function DragHandle({ id, className }: DragHandleProps) {
	const { attributes, listeners } = useSortable({
		id,
	})

	return (
		<Button
			{...attributes}
			{...listeners}
			variant="ghost"
			size="icon"
			className={`size-7 text-muted-foreground hover:bg-transparent ${className || ''}`}
			aria-label={`Drag to reorder item ${id}`}
		>
			<GripVerticalIcon className="size-3 text-muted-foreground" />
			<span className="sr-only">Drag to reorder</span>
		</Button>
	)
}
