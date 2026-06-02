'use client'

import { Heart, Share } from 'lucide-react'
import { Button } from '~/components/base/button'

interface SidebarActionsProps {
	isFollowing: boolean
	onToggleFollow: () => void
	onShare: () => void
}

export function SidebarActions({ isFollowing, onToggleFollow, onShare }: SidebarActionsProps) {
	return (
		<div className="flex gap-4">
			<Button
				variant="outline"
				className="gradient-border-btn flex w-full items-center justify-center gap-2 bg-white"
				onClick={onToggleFollow}
				aria-label={isFollowing ? 'Unfollow project' : 'Follow project'}
			>
				<Heart
					className={`h-4 w-4 ${isFollowing ? 'text-red-500 fill-red-500' : ''}`}
					aria-hidden
				/>
				{isFollowing ? 'Following' : 'Follow'}
			</Button>

			<Button
				variant="outline"
				className="gradient-border-btn flex w-full items-center justify-center gap-2 bg-white"
				onClick={onShare}
				aria-label="Share project"
			>
				<Share className="w-4 h-4" aria-hidden />
				Share
			</Button>
		</div>
	)
}
