import dynamic from 'next/dynamic'
import { Skeleton } from '~/components/base/skeleton'

export const SkeletonAboutHero = () => (
	<div className="container mx-auto px-4 py-16 md:py-24">
		<Skeleton className="mx-auto mb-6 h-10 w-2/3 max-w-xl" />
		<Skeleton className="mx-auto h-6 w-full max-w-2xl" />
		<Skeleton className="mx-auto mt-2 h-6 w-4/5 max-w-xl" />
	</div>
)

export const SkeletonAboutSection = () => (
	<div className="container mx-auto space-y-4 px-4 py-12">
		<Skeleton className="h-8 w-48" />
		<Skeleton className="h-4 w-full" />
		<Skeleton className="h-4 w-5/6" />
		<Skeleton className="h-4 w-4/6" />
	</div>
)

const sectionLoading = () => <SkeletonAboutSection />

export const DynamicAboutSections = {
	Hero: dynamic(() => import('./hero').then((mod) => mod.Hero), {
		ssr: true,
		loading: SkeletonAboutHero,
	}),
	MissionVision: dynamic(() => import('./mission-vision').then((mod) => mod.MissionVision), {
		loading: sectionLoading,
	}),
	Problems: dynamic(() => import('./problems').then((mod) => mod.Problems), {
		loading: sectionLoading,
	}),
	KindFiStellar: dynamic(() => import('./kindfi-stellar').then((mod) => mod.KindFiStellar), {
		loading: sectionLoading,
	}),
	HowItWorks: dynamic(() => import('./how-it-works').then((mod) => mod.HowItWorks), {
		loading: sectionLoading,
	}),
	WhyKindFiIsDifferent: dynamic(
		() => import('./why-is-different').then((mod) => mod.WhyKindFiIsDifferent),
		{ loading: sectionLoading },
	),
	Roadmap: dynamic(() => import('./roadmap').then((mod) => mod.Roadmap), {
		loading: sectionLoading,
	}),
	CallToAction: dynamic(() => import('./call-to-action').then((mod) => mod.CallToAction), {
		loading: sectionLoading,
	}),
}
