'use client'

import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import { CalendarDays, Mail, Settings2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'
import { profileFadeUp } from './profile-motion'
import { ProfileSurfaceCard } from './profile-surface-card'

type Role = Database['public']['Enums']['user_role'] | null

interface ProfileHeaderProps {
	displayName: string
	email: string
	imageUrl: string | null
	bio: string | null
	role: Role
	createdAt: string
	onOpenSettings?: () => void
}

const ROLE_LABEL_KEYS: Record<
	string,
	'profile.roleCreator' | 'profile.roleDonor' | 'profile.roleAdmin'
> = {
	creator: 'profile.roleCreator',
	donor: 'profile.roleDonor',
	admin: 'profile.roleAdmin',
}

export function ProfileHeader({
	displayName,
	email,
	imageUrl,
	bio,
	role,
	createdAt,
	onOpenSettings,
}: ProfileHeaderProps) {
	const { t } = useI18n()

	const initials = displayName
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)

	const roleLabelKey = role ? ROLE_LABEL_KEYS[role] : undefined
	const roleLabel = roleLabelKey ? t(roleLabelKey) : t('profile.rolePending')

	const memberSince = new Date(createdAt).toLocaleDateString(undefined, {
		month: 'long',
		year: 'numeric',
	})

	return (
		<motion.div {...profileFadeUp(0)}>
			<ProfileSurfaceCard padding="lg" className="relative overflow-hidden">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-50/80 to-transparent" />

				<div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
						<div className="relative shrink-0">
							<div className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-400/40 via-teal-300/20 to-indigo-300/30 blur-sm" />
							<Avatar className="relative h-24 w-24 border-4 border-white shadow-lg sm:h-28 sm:w-28">
								<AvatarImage src={imageUrl || undefined} alt={displayName} />
								<AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-700 text-2xl font-bold text-white">
									{initials}
								</AvatarFallback>
							</Avatar>
						</div>

						<div className="min-w-0 space-y-3">
							<div className="space-y-2">
								<p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
									{t('profile.eyebrow')}
								</p>
								<h1 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
									{displayName}
								</h1>
								{bio ? (
									<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
										{bio}
									</p>
								) : null}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<Badge
									className={cn(
										'rounded-full px-3 py-1 text-xs font-medium',
										role === 'creator'
											? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-50'
											: role === 'donor'
												? 'bg-indigo-50 text-indigo-800 hover:bg-indigo-50'
												: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
									)}
								>
									<Sparkles className="mr-1 h-3 w-3" />
									{roleLabel}
								</Badge>
								<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
									<CalendarDays className="h-3.5 w-3.5" />
									{t('profile.memberSince')} {memberSince}
								</span>
							</div>

							<p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
								<Mail className="h-4 w-4 shrink-0" />
								<span className="truncate">{email}</span>
							</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-2 lg:justify-end">
						{onOpenSettings ? (
							<Button
								type="button"
								variant="outline"
								className="rounded-full border-slate-200 bg-white/80"
								onClick={onOpenSettings}
							>
								<Settings2 className="mr-2 h-4 w-4" />
								{t('profile.settings')}
							</Button>
						) : null}
						{role === 'creator' ? (
							<Button asChild className="gradient-btn rounded-full px-5 text-white shadow-md">
								<Link href="/create-project">{t('profile.createCampaign')}</Link>
							</Button>
						) : (
							<Button asChild className="gradient-btn rounded-full px-5 text-white shadow-md">
								<Link href="/projects">{t('profile.exploreCauses')}</Link>
							</Button>
						)}
					</div>
				</div>
			</ProfileSurfaceCard>
		</motion.div>
	)
}
