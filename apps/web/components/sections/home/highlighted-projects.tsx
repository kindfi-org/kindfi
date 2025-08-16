'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import Autoplay from 'embla-carousel-autoplay'
import { useState } from 'react'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '~/components/base/carousel'
import { ProjectCardGrid } from '~/components/sections/projects/cards'
import { ProjectCardGridSkeleton } from '~/components/sections/projects/skeletons'
import { CategoryPills } from '~/components/sections/home/category-pills'
import { CTAButtons } from '~/components/shared/cta-buttons'
import { SectionCaption } from '~/components/shared/section-caption'
import { getAllCategories, getAllProjects } from '~/lib/queries/projects'
import { WaitlistModal } from '~/components/sections/waitlist/waitlist-modal'
import router from 'next/router'

export function HighlightedProjects() {
    const [waitlistOpen, setWaitlistOpen] = useState(false)
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
		<section className="w-full px-4 py-10 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-[1400px]">
				<SectionCaption
					title="Change Lives One Block at a Time"
					subtitle="From clean water and education to healthcare and child welfare, each project on KindFi represents a real-world AID opportunity to make a difference. Explore verified community-backed campaigns, track progress transparently, and support what moves you all through the power of blockchain"
					highlightWords={['Change Lives One Block at a Time']}
				/>

				<CategoryPills
					categories={categories}
					isLoading={isLoadingCategories}
					error={errorCategories}
				/>

				{isLoading ? (
					<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
							<ProjectCardGridSkeleton key={i} />
						))}
					</div>
				) : error ? (
					<p className="text-sm text-destructive text-center mt-8">
						Failed to load featured projects. Please try again later.
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
										className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
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
                        primaryText="Waitlist Your Project"
                        secondaryText="Explore Causes"
                        primaryHref={''}
                        secondaryHref={'/projects'}
                        onPrimaryClick={() => setWaitlistOpen(true)}
                        onSecondaryClick={() => router.push('/projects')}
                    />
                    <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
				</div>
			</div>
		</section>
	)
}
