import dynamic from 'next/dynamic'
import {
	SkeletonCommunity,
	SkeletonFinalCTA,
	SkeletonHero,
	SkeletonHighlightedProjects,
	SkeletonHowItWorks,
	SkeletonJoinUs,
	SkeletonNewUserGuide,
	SkeletonPlatformOverview,
	SkeletonUserJourney,
} from '~/components/sections/home/skeletons'
import KYC from '~/components/shared/kyc/kyc-2/kyc-2-upload'

const Hero = dynamic(
	() => import('~/components/sections/home/hero').then((mod) => mod.Hero),
	{
		ssr: true,
		loading: SkeletonHero,
	},
)
const UserJourney = dynamic(
	() =>
		import('~/components/sections/home/user-journey').then(
			(mod) => mod.UserJourney,
		),
	{
		loading: SkeletonUserJourney,
	},
)
const HighlightedProjects = dynamic(
	() =>
		import('~/components/sections/home/highlighted-projects').then(
			(mod) => mod.HighlightedProjects,
		),
	{
		loading: SkeletonHighlightedProjects,
	},
)
const JoinUs = dynamic(
	() => import('~/components/sections/home/join-us').then((mod) => mod.JoinUs),
	{
		loading: SkeletonJoinUs,
	},
)
const HowItWorks = dynamic(
	() =>
		import('~/components/sections/home/how-it-works').then(
			(mod) => mod.HowItWorks,
		),
	{
		loading: SkeletonHowItWorks,
	},
)
const NewUserGuide = dynamic(
	() =>
		import('~/components/sections/home/new-user-guide').then(
			(mod) => mod.NewUserGuide,
		),
	{
		loading: SkeletonNewUserGuide,
	},
)
const PlatformOverview = dynamic(
	() =>
		import('~/components/sections/home/platform-overview').then(
			(mod) => mod.PlatformOverview,
		),
	{
		loading: SkeletonPlatformOverview,
	},
)
const Community = dynamic(
	() =>
		import('~/components/sections/home/community').then((mod) => mod.Community),
	{
		loading: SkeletonCommunity,
	},
)
const FinalCTA = dynamic(
	() =>
		import('~/components/sections/home/final-cta').then((mod) => mod.FinalCTA),
	{
		loading: SkeletonFinalCTA,
	},
)

export function HomeDashboard() {
	return (
		<>
			<KYC />
			<Hero />
			<UserJourney />
			<HighlightedProjects />
			<JoinUs />
			<HowItWorks />
			<NewUserGuide />
			<PlatformOverview />
			<Community />
			<FinalCTA />
		</>
	)
}
