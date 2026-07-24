'use client'

import type { Tag } from '~/lib/types/project'
import { cn } from '~/lib/utils'
import { hexToRgba, normalizeHexColor } from '~/lib/utils/color-utils'

export type ProjectTagLike = Pick<Tag, 'name' | 'color'> & { id?: string }

interface ProjectTagBadgeProps {
	tag: ProjectTagLike
	className?: string
}

export function ProjectTagBadge({ tag, className }: ProjectTagBadgeProps) {
	const color = normalizeHexColor(tag.color, '#94a3b8')

	return (
		<span
			className={cn(
				'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none text-slate-700',
				className,
			)}
			style={{
				backgroundColor: hexToRgba(color, 0.1),
				borderColor: hexToRgba(color, 0.24),
			}}
		>
			<span
				className="h-1.5 w-1.5 shrink-0 rounded-full"
				style={{ backgroundColor: color }}
				aria-hidden="true"
			/>
			<span className="truncate" title={tag.name}>
				{tag.name}
			</span>
		</span>
	)
}

interface ProjectTagListProps {
	tags: ProjectTagLike[]
	limit?: number
	className?: string
	ariaLabel?: string
}

export function ProjectTagList({
	tags,
	limit,
	className,
	ariaLabel = 'Project tags',
}: ProjectTagListProps) {
	if (!tags.length) return null

	const visibleTags = limit ? tags.slice(0, limit) : tags

	return (
		<ul className={cn('flex list-none flex-wrap gap-1.5', className)} aria-label={ariaLabel}>
			{visibleTags.map((tag) => (
				<li key={tag.id ?? tag.name}>
					<ProjectTagBadge tag={tag} />
				</li>
			))}
		</ul>
	)
}
