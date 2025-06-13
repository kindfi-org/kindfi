import { useSortable } from '@dnd-kit/sortable'
import { GripVerticalIcon } from 'lucide-react'
import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

interface DragHandleProps {
	id: string
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
			className={cn(
				'size-7 text-muted-foreground hover:bg-transparent',
				className,
			)}
			aria-label={`Drag to reorder item ${id}`}
		>
			<GripVerticalIcon className="size-3 text-muted-foreground" />
			<span className="sr-only">Drag to reorder</span>
		</Button>
	)
}
