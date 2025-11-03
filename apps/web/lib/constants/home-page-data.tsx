import dynamic from 'next/dynamic'
import {
	SkeletonHero,
	SkeletonHighlightedProjects,
	SkeletonHowItWorks,
	SkeletonJoinUs,
	SkeletonNewUserGuide,
	SkeletonPlatformOverview,
	SkeletonUserJourney,
} from '~/components/sections/home/skeletons'

export const DynamicComponents = {
	Hero: dynamic(
		() => import('~/components/sections/home/hero').then((mod) => mod.Hero),
		{
			ssr: true,
			loading: SkeletonHero,
		},
	),
	UserJourney: dynamic(
		() =>
			import('~/components/sections/home/user-journey').then(
				(mod) => mod.UserJourney,
			),
		{
			loading: SkeletonUserJourney,
		},
	),
	HighlightedProjects: dynamic(
		() =>
			import('~/components/sections/home/highlighted-projects').then(
				(mod) => mod.HighlightedProjects,
			),
		{
			loading: SkeletonHighlightedProjects,
		},
	),
	JoinUs: dynamic(
		() =>
			import('~/components/sections/home/join-us').then((mod) => mod.JoinUs),
		{
			loading: SkeletonJoinUs,
		},
	),
	HowItWorks: dynamic(
		() =>
			import('~/components/sections/home/how-it-works').then(
				(mod) => mod.HowItWorks,
			),
		{
			loading: SkeletonHowItWorks,
		},
	),
	NewUserGuide: dynamic(
		() =>
			import('~/components/sections/home/new-user-guide').then(
				(mod) => mod.NewUserGuide,
			),
		{
			loading: SkeletonNewUserGuide,
		},
	),
	PlatformOverview: dynamic(
		() =>
			import('~/components/sections/home/platform-overview').then(
				(mod) => mod.PlatformOverview,
			),
		{
			loading: SkeletonPlatformOverview,
		},
	),
}
