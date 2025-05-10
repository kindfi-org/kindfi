'use client'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import type { ProjectOwner as ProjectOwnerType } from '~/lib/types/project/project-detail.types'

interface ProjectOwnerProps {
	owner: ProjectOwnerType
}

export function ProjectOwner({ owner }: ProjectOwnerProps) {
	return (
		<div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
			<Avatar className="h-12 w-12">
				<AvatarImage
					src={owner.avatar || '/images/placeholder.png'}
					alt={owner.name}
				/>
				<AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
			</Avatar>
			<div className="flex-1">
				<div className="flex items-center gap-2">
					<h3 className="font-medium">{owner.name}</h3>
					<span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
						Creator
					</span>
				</div>
				<p className="text-sm text-muted-foreground line-clamp-1">
					{owner.bio}
				</p>
			</div>
		</div>
	)
}
