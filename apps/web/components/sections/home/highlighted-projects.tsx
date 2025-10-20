'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import Autoplay from 'embla-carousel-autoplay'
import router from 'next/router'
import { useState } from 'react'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '~/components/base/carousel'
import { CategoryPills } from '~/components/sections/home/category-pills'
import { ProjectCardGrid } from '~/components/sections/projects/cards'
import { ProjectCardGridSkeleton } from '~/components/sections/projects/skeletons'
import { WaitlistModal } from '~/components/sections/waitlist/waitlist-modal'
import { CTAButtons } from '~/components/shared/cta-buttons'
import { SectionCaption } from '~/components/shared/section-caption'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import { getAllCategories, getAllProjects } from '~/lib/queries/projects'

export function HighlightedProjects() {
	const [waitlistOpen, setWaitlistOpen] = useState(false)
	const { t } = useI18n()
	const {
		data: projects = [],
		isLoading,
		error,
	} = useSupabaseQuery('highlighted-projects', (client) =>
		getAllProjects(client, [], 'most-recent', 6),
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
		<section className="py-10 bg-white">
			<SectionContainer>
				<SectionCaption
					title={t('home.highlightedProjectsTitle')}
					subtitle={t('home.highlightedProjectsSubtitle')}
					highlightWords={[t('home.highlightedProjectsTitle')]}
				/>

				<CategoryPills
					categories={categories}
					isLoading={isLoadingCategories}
					error={errorCategories}
				/>

				{isLoading ? (
					<div className="mt-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
							<ProjectCardGridSkeleton key={i} />
						))}
					</div>
				) : error ? (
					<p className="text-sm text-destructive text-center mt-8">
						{t('home.failedToLoadProjects')}
					</p>
				) : (
					<div className="relative mt-8">
						<Carousel
							opts={{
								align: 'start',
								loop: true,
							}}
							plugins={[
								Autoplay({
									delay: 2000,
								}),
							]}
							className="w-full"
							aria-label="Featured Projects"
						>
							<CarouselContent className="-ml-2 md:-ml-4">
								{projects.map((project) => (
									<CarouselItem
										key={project.id}
										className="pl-2 md:pl-4 basis-full sm:basis-full md:basis-1/2 lg:basis-1/2 xl:basis-1/3"
										aria-roledescription="slide"
									>
										<ProjectCardGrid project={project} />
									</CarouselItem>
								))}
							</CarouselContent>
						</Carousel>
					</div>
				)}

				<div className="mt-12 flex justify-center">
					<CTAButtons
						primaryText={t('home.waitlistYourProject')}
						secondaryText={t('home.exploreCauses')}
						primaryHref={''}
						secondaryHref={'/projects'}
						onPrimaryClick={() => setWaitlistOpen(true)}
						onSecondaryClick={() => router.push('/projects')}
					/>
					<WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
				</div>
			</SectionContainer>
		</section>
	)
}
