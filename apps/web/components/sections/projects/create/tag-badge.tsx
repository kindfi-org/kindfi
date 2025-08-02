'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import type { Tag } from '~/lib/types/project/create-project.types'
import { cn } from '~/lib/utils'
import { getContrastTextColor } from '~/lib/utils/color-utils'

interface TagBadgeProps {
	tag: Tag
	onRemove: () => void
	showRemoveButton: boolean
}

export function TagBadge({ tag, onRemove, showRemoveButton }: TagBadgeProps) {
	const textColor = getContrastTextColor(tag.color)

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.8 }}
			transition={{ duration: 0.2 }}
		>
			<Badge
				variant="secondary"
				className={cn(
					'flex items-center gap-1 px-3 py-1 text-sm font-medium border-0',
					textColor,
				)}
				style={{
					backgroundColor: tag.color,
				}}
			>
				<span>{tag.name.toUpperCase()}</span>
				{showRemoveButton && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-4 w-4 p-0 hover:bg-black/20 rounded-full ml-1"
						onClick={onRemove}
						aria-label={`Remove tag ${tag.name}`}
						style={{ color: textColor }}
					>
						<X className="h-3 w-3" />
					</Button>
				)}
			</Badge>
		</motion.div>
	)
}
