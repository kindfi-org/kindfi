'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Globe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '~/components/base/card'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'
import { getSocialIcon } from '../utils/get-social-icon'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>

interface FoundationFounderCardProps {
	founder: NonNullable<Foundation['founder']>
	shouldReduceMotion: boolean | null
}

export function FoundationFounderCard({ founder, shouldReduceMotion }: FoundationFounderCardProps) {
	return (
		<motion.div
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.4 }}
		>
			<Card className="h-full border-slate-200/80 bg-white shadow-sm">
				<CardContent className="p-6 md:p-8">
					<h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Founder</h2>
					<div className="flex items-start gap-4">
						{founder.imageUrl ? (
							founder.slug ? (
								<Link
									href={`/u/${founder.slug}`}
									className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-border transition-shadow hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								>
									<Image src={founder.imageUrl} alt="" fill className="object-cover" sizes="80px" />
								</Link>
							) : (
								<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
									<Image src={founder.imageUrl} alt="" fill className="object-cover" sizes="80px" />
								</div>
							)
						) : (
							<div className="h-20 w-20 shrink-0 rounded-full bg-muted ring-2 ring-border" />
						)}
						<div className="min-w-0 flex-1">
							{founder.slug ? (
								<Link
									href={`/u/${founder.slug}`}
									className="mb-2 block rounded text-xl font-bold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								>
									{founder.displayName || 'Anonymous'}
								</Link>
							) : (
								<p className="mb-2 text-xl font-bold">{founder.displayName || 'Anonymous'}</p>
							)}
							{founder.bio && (
								<p className="text-sm leading-relaxed text-muted-foreground">{founder.bio}</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
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
	if (!websiteUrl && Object.keys(socialLinks).length === 0) {
		return null
	}

	return (
		<motion.div
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.5 }}
		>
			<Card className="h-full border-slate-200/80 bg-white shadow-sm">
				<CardContent className="p-6 md:p-8">
					<h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Connect</h2>
					<div className="flex flex-col gap-3">
						{websiteUrl && (
							<a
								href={websiteUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<div className="rounded-lg bg-emerald-50 p-2 transition-colors group-hover:bg-emerald-100">
									<Globe className="h-5 w-5 text-emerald-700" aria-hidden="true" />
								</div>
								<span className="flex-1 font-medium">Website</span>
								<ArrowRight
									className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
									aria-hidden="true"
								/>
							</a>
						)}
						{Object.entries(socialLinks).map(([platform, url]) => {
							const Icon = getSocialIcon(platform)
							return (
								<a
									key={platform}
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 capitalize transition-colors hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									<div className="rounded-lg bg-emerald-50 p-2 transition-colors group-hover:bg-emerald-100">
										<Icon className="h-5 w-5 text-emerald-700" aria-hidden="true" />
									</div>
									<span className="flex-1 font-medium">{platform}</span>
									<ArrowRight
										className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
										aria-hidden="true"
									/>
								</a>
							)
						})}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}
