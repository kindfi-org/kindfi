'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
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
			transition={{ delay: shouldReduceMotion ? 0 : 0.15, duration: 0.5 }}
			aria-labelledby="foundation-team-heading"
			className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
		>
			<div className="mb-6 flex items-start gap-3 sm:mb-8">
				<div className="rounded-xl bg-emerald-600/10 p-2.5">
					<Users className="h-5 w-5 text-emerald-700" aria-hidden="true" />
				</div>
				<div>
					<p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
						{t('foundations.teamEyebrow')}
					</p>
					<h2
						id="foundation-team-heading"
						className="text-2xl font-bold tracking-tight text-slate-900"
					>
						{t('foundations.team')}
					</h2>
					<p className="mt-1 text-sm text-slate-500">{t('foundations.teamDescription')}</p>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{teamMembers.map((member, index) => (
					<TeamMemberCard key={member.id} member={member} index={index} />
				))}
			</div>
		</motion.section>
	)
}
