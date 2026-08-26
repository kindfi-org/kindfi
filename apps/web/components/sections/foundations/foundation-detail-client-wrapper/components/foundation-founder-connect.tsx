'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Globe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '~/lib/i18n'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'
import { getSocialIcon } from '../utils/get-social-icon'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>

interface FoundationFounderCardProps {
	founder: NonNullable<Foundation['founder']>
	shouldReduceMotion: boolean | null
}

export function FoundationFounderCard({ founder, shouldReduceMotion }: FoundationFounderCardProps) {
	const { t } = useI18n()

	return (
		<motion.article
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.25, duration: 0.5 }}
			className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
		>
			<p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
				{t('foundations.foundedBy')}
			</p>
			<h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
				{t('foundations.founder')}
			</h2>
			<div className="flex items-start gap-4">
				{founder.imageUrl ? (
					founder.slug ? (
						<Link
							href={`/u/${founder.slug}`}
							className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-slate-200 transition-shadow hover:ring-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							<Image src={founder.imageUrl} alt="" fill className="object-cover" sizes="80px" />
						</Link>
					) : (
						<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-slate-200">
							<Image src={founder.imageUrl} alt="" fill className="object-cover" sizes="80px" />
						</div>
					)
				) : (
					<div className="h-20 w-20 shrink-0 rounded-2xl bg-slate-100 ring-2 ring-slate-200" />
				)}
				<div className="min-w-0 flex-1">
					{founder.slug ? (
						<Link
							href={`/u/${founder.slug}`}
							className="mb-2 block rounded text-xl font-bold text-slate-900 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							{founder.displayName || 'Anonymous'}
						</Link>
					) : (
						<p className="mb-2 text-xl font-bold text-slate-900">
							{founder.displayName || 'Anonymous'}
						</p>
					)}
					{founder.bio ? (
						<p className="text-sm leading-relaxed text-slate-500">{founder.bio}</p>
					) : null}
				</div>
			</div>
		</motion.article>
	)
}

interface FoundationConnectCardProps {
	websiteUrl: string | null | undefined
	socialLinks: Foundation['socialLinks']
	shouldReduceMotion: boolean | null
}

export function FoundationConnectCard({
	websiteUrl,
	socialLinks,
	shouldReduceMotion,
}: FoundationConnectCardProps) {
	const { t } = useI18n()

	if (!websiteUrl && Object.keys(socialLinks).length === 0) {
		return null
	}

	return (
		<motion.article
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.3, duration: 0.5 }}
			className="relative h-full overflow-hidden rounded-2xl border border-emerald-100/80 bg-linear-to-br from-emerald-50/70 via-white to-white p-6 shadow-sm md:p-8"
		>
			<div
				className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-200/35 blur-3xl"
				aria-hidden="true"
			/>
			<div className="relative">
				<p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
					{t('foundations.connectEyebrow')}
				</p>
				<h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
					{t('foundations.connect')}
				</h2>
				<div className="flex flex-col gap-3">
					{websiteUrl ? (
						<a
							href={websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center gap-3 rounded-xl border border-white/80 bg-white/80 p-3 shadow-sm transition-colors hover:border-emerald-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<div className="rounded-lg bg-emerald-50 p-2 transition-colors group-hover:bg-emerald-100">
								<Globe className="h-5 w-5 text-emerald-700" aria-hidden="true" />
							</div>
							<span className="flex-1 font-medium text-slate-800">{t('foundations.website')}</span>
							<ArrowRight
								className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-emerald-700"
								aria-hidden="true"
							/>
						</a>
					) : null}
					{Object.entries(socialLinks).map(([platform, url]) => {
						const Icon = getSocialIcon(platform)
						return (
							<a
								key={platform}
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex items-center gap-3 rounded-xl border border-white/80 bg-white/80 p-3 capitalize shadow-sm transition-colors hover:border-emerald-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<div className="rounded-lg bg-emerald-50 p-2 transition-colors group-hover:bg-emerald-100">
									<Icon className="h-5 w-5 text-emerald-700" aria-hidden="true" />
								</div>
								<span className="flex-1 font-medium text-slate-800">{platform}</span>
								<ArrowRight
									className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-emerald-700"
									aria-hidden="true"
								/>
							</a>
						)
					})}
				</div>
			</div>
		</motion.article>
	)
}
