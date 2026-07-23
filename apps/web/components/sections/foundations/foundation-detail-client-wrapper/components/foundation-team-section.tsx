'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { Card, CardContent } from '~/components/base/card'
import { TeamMemberCard } from '~/components/sections/projects/members/team-member-card'
import { useI18n } from '~/lib/i18n'
import { getFoundationTeamBySlug } from '~/lib/queries/foundations/get-foundation-team-by-slug'

interface FoundationTeamSectionProps {
	slug: string
	shouldReduceMotion: boolean | null
}

export function FoundationTeamSection({ slug, shouldReduceMotion }: FoundationTeamSectionProps) {
	const { t } = useI18n()
	const { data: teamData, isLoading } = useSupabaseQuery(
		'foundation-team',
		(client) => getFoundationTeamBySlug(client, slug),
		{ additionalKeyValues: [slug] },
	)

	const teamMembers = teamData?.team ?? []

	if (isLoading || teamMembers.length === 0) {
		return null
	}

	return (
		<motion.section
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.15 }}
			aria-labelledby="foundation-team-heading"
		>
			<Card className="border-slate-200/80 bg-white shadow-sm">
				<CardContent className="p-6 md:p-8">
					<div className="mb-6 flex items-center gap-3">
						<div className="rounded-lg bg-emerald-50 p-2">
							<Users className="h-5 w-5 text-emerald-700" aria-hidden="true" />
						</div>
						<div>
							<h2
								id="foundation-team-heading"
								className="text-2xl font-bold tracking-tight text-slate-900"
							>
								{t('foundations.team')}
							</h2>
							<p className="text-sm text-muted-foreground">{t('foundations.teamDescription')}</p>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{teamMembers.map((member, index) => (
							<TeamMemberCard key={member.id} member={member} index={index} />
						))}
					</div>
				</CardContent>
			</Card>
		</motion.section>
	)
}
