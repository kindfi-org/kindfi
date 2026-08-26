'use client'

import { Heart } from 'lucide-react'
import { Button } from '~/components/base/button'
import { ShareButtons } from '~/components/shared/share-buttons'

interface SidebarActionsProps {
	isFollowing: boolean
	onToggleFollow: () => void
	shareUrl: string
	shareTitle: string
	shareDescription?: string
}

export function SidebarActions({
	isFollowing,
	onToggleFollow,
	shareUrl,
	shareTitle,
	shareDescription,
}: SidebarActionsProps) {
	return (
		<div className="space-y-4">
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

			<div>
				<p className="mb-2 text-sm font-medium text-slate-700">Share</p>
				<ShareButtons
					url={shareUrl}
					title={shareTitle}
					description={shareDescription}
					variant="pill"
				/>
			</div>
		</div>
	)
}
