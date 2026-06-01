'use client'

import { Building2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { cn } from '~/lib/utils'
import { getContrastTextColor } from '~/lib/utils/color-utils'

export function ProjectSidebarFooter({ project }: { project: ProjectDetail }) {
	return (
		<>
			{project.foundation && (
				<div className="p-6 bg-purple-50/50 border-t border-gray-200">
					<h3 className="mb-2 font-medium">Foundation</h3>
					<Link
						href={`/foundations/${project.foundation.slug}`}
						className="flex items-center gap-3 p-3 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
					>
						<div className="p-2 rounded-lg bg-purple-100 shrink-0">
							<Building2
								className="h-5 w-5 text-purple-600"
								aria-hidden="true"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<p className="font-semibold text-purple-900 truncate">
								{project.foundation.name}
							</p>
							<p className="text-xs text-muted-foreground">View foundation</p>
						</div>
						<ExternalLink
							className="h-4 w-4 text-purple-600 shrink-0"
							aria-hidden="true"
						/>
					</Link>
				</div>
			)}

			<div className="p-6 bg-gray-50 border-t border-gray-200">
				<h3 className="mb-2 font-medium">Project Tags</h3>
				<div className="flex flex-wrap gap-2">
					{project.tags.map((tag) => {
						const bg = tag.color || '#ccc'
						const textColor = getContrastTextColor(bg)

						return (
							<Badge
								key={tag.id}
								className={cn('uppercase', textColor)}
								style={{ backgroundColor: bg }}
							>
								{tag.name}
							</Badge>
						)
					})}
				</div>
			</div>
		</>
	)
}
