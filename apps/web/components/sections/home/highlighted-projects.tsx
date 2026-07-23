'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import Autoplay from 'embla-carousel-autoplay'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Carousel, CarouselContent, CarouselItem } from '~/components/base/carousel'
import { CategoryPills } from '~/components/sections/home/category-pills'
import { ProjectCardGrid } from '~/components/sections/projects/cards'
import { ProjectCardGridSkeleton } from '~/components/sections/projects/skeletons'
import { CTAButtons } from '~/components/shared/cta-buttons'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import { getAllCategories, getAllProjects } from '~/lib/queries/projects'

const WaitlistModal = dynamic(
	() =>
		import('~/components/sections/waitlist/waitlist-modal').then((mod) => ({
			default: mod.WaitlistModal,
		})),
	{
		loading: () => null,
		ssr: false,
	},
)

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 20 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: '-80px' },
	transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
})

export function HighlightedProjects() {
	const [waitlistOpen, setWaitlistOpen] = useState(false)
	const { t, language } = useI18n()
	const {
		data: projects = [],
		isLoading,
		error,
	} = useSupabaseQuery(
		'highlighted-projects',
		(client) => getAllProjects(client, [], 'most-recent', 6, { viewerLocale: language }),
		{
			additionalKeyValues: [language],
		},
	)

	const {
		data: categories = [],
		isLoading: isLoadingCategories,
		error: errorCategories,
	} = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60,
	})

	return (
		<section className="relative overflow-hidden bg-[#fafbfc] pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
				<div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
				<div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-indigo-200/25 blur-3xl" />
			</div>

			<SectionContainer className="relative">
				<motion.header {...fadeUp(0)} className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
					<p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
						{t('home.highlightedProjectsEyebrow')}
					</p>
					<h2 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
						{t('home.highlightedProjectsTitle')}{' '}
						<span className="gradient-text">{t('home.highlightedProjectsTitleHighlight')}</span>
					</h2>
					<p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
						{t('home.highlightedProjectsSubtitle')}
					</p>
					<p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-[13px]">
						{t('home.highlightedProjectsTrustLine')}
					</p>
				</motion.header>

				<motion.div {...fadeUp(0.1)}>
					<p className="mb-3 text-center text-sm font-medium text-slate-500">
						{t('home.highlightedProjectsBrowseLabel')}
					</p>
					<CategoryPills
						categories={categories}
						isLoading={isLoadingCategories}
						error={errorCategories}
						className="mt-0"
					/>
				</motion.div>

				{isLoading ? (
					<div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
							<ProjectCardGridSkeleton key={i} />
						))}
					</div>
				) : error ? (
					<p className="mt-10 text-center text-sm text-destructive">
						{t('home.failedToLoadProjects')}
					</p>
				) : (
					<motion.div {...fadeUp(0.15)} className="relative mt-10">
						<Carousel
							opts={{
								align: 'start',
								loop: true,
							}}
							plugins={[
								Autoplay({
									delay: 4500,
									stopOnInteraction: true,
								}),
							]}
							className="w-full"
							aria-label="Featured Projects"
						>
							<CarouselContent className="-ml-3 md:-ml-4">
								{projects.map((project, index) => (
									<CarouselItem
										key={project.id}
										className="pl-3 md:pl-4 basis-full md:basis-1/2 xl:basis-1/3"
										aria-roledescription="slide"
									>
										<ProjectCardGrid project={project} index={index} />
									</CarouselItem>
								))}
							</CarouselContent>
						</Carousel>
					</motion.div>
				)}

				<div className="mt-12 flex justify-center sm:mt-14">
					<CTAButtons
						primaryText={t('home.exploreCauses')}
						secondaryText={t('home.waitlistYourProject')}
						primaryHref="/projects"
						onSecondaryClick={() => setWaitlistOpen(true)}
						animationDelay={0.2}
					/>
					<WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
				</div>
			</SectionContainer>
		</section>
	)
}
