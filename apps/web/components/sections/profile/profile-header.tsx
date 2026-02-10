'use client'

import type { Database } from '@services/supabase'
import { Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'

type Role = Database['public']['Enums']['user_role'] | null

interface ProfileHeaderProps {
	displayName: string
	email: string
	imageUrl: string | null
	role: Role | null
	createdAt: string
}

const ROLE_LABELS: Record<string, string> = {
	creator: 'Creator',
	donor: 'Donor',
	admin: 'Admin',
}

export function ProfileHeader({
	displayName,
	email,
	imageUrl,
	role,
	createdAt,
}: ProfileHeaderProps) {
	const initials = displayName
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)

	const roleLabel = (role && ROLE_LABELS[role]) || 'Select Role'

	return (
		<div className="rounded-xl border border-border bg-card p-6 lg:p-8">
			<div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
				{/* Avatar */}
				<Avatar className="h-20 w-20 lg:h-24 lg:w-24 border-2 border-border shadow-sm">
					<AvatarImage src={imageUrl || undefined} alt={displayName} />
					<AvatarFallback className="text-xl lg:text-2xl font-bold bg-primary text-primary-foreground">
						{initials}
					</AvatarFallback>
				</Avatar>

				{/* Info */}
				<div className="flex-1 min-w-0 space-y-1.5">
					<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
						<h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight truncate">
							{displayName}
						</h1>
						<Badge
							variant="secondary"
							className="w-fit text-xs font-medium px-3 py-1"
						>
							<Sparkles className="h-3 w-3 mr-1" />
							{roleLabel}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">{email}</p>
					<p className="text-xs text-muted-foreground/70">
						Member since{' '}
						{new Date(createdAt).toLocaleDateString('en-US', {
							month: 'long',
							year: 'numeric',
						})}
					</p>
				</div>
			</div>
		</div>
	)
}
