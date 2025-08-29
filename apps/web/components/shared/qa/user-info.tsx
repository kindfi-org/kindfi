'use client'
import { formatDistanceToNow } from 'date-fns'
import { User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import type { ProfileRow, UserData } from '~/lib/types/project/project-qa.types'

export interface UserInfoProps {
	authorData?: UserData
	createdAt: string
	size?: 'sm' | 'md'
}

export function UserInfo({
	authorData,
	createdAt,
	size = 'md',
}: UserInfoProps) {
	if (!authorData) {
		return null
	}

	const avatarSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
	const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
	const nameSize = size === 'sm' ? 'text-sm' : 'text-base'
	const timeSize = size === 'sm' ? 'text-xs' : 'text-sm'

	// Narrow union: profile row vs guest shape
	let avatarUrl: string | null = null
	let displayName: string = ''
	let role: string | undefined

	if ('display_name' in authorData) {
		const profile = authorData as ProfileRow
		avatarUrl = profile.image_url
		displayName = profile.display_name || `User ${profile.id.substring(0, 6)}`
		role = profile.role
	} else {
		// guest shape
		displayName =
			authorData.full_name || `User ${authorData.id.substring(0, 6)}`
	}

	// Accessible alt text: prefer real names; fall back to a generic label if none provided
	const directName =
		'display_name' in authorData
			? (authorData as ProfileRow).display_name
			: authorData.full_name
	const nameForAlt = directName?.trim()
	const avatarAltText = nameForAlt ? `Avatar of ${nameForAlt}` : 'User avatar'

	return (
		<div className="flex gap-2 items-center">
			<Avatar className={avatarSize}>
				{avatarUrl ? (
					<AvatarImage src={avatarUrl} alt={avatarAltText} />
				) : (
					<AvatarFallback>
						<UserIcon className={iconSize} aria-hidden="true" />
					</AvatarFallback>
				)}
			</Avatar>
			<div>
				<div className="flex items-center">
					<p className={`font-medium ${nameSize}`}>{displayName}</p>
					{role && (
						<Badge
							variant="outline"
							className="py-0 ml-2 h-5 text-xs text-blue-700 bg-blue-50 border-blue-200"
						>
							{role}
						</Badge>
					)}
				</div>
				<p className={`text-muted-foreground ${timeSize}`}>
					{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
				</p>
			</div>
		</div>
	)
}

export default UserInfo
