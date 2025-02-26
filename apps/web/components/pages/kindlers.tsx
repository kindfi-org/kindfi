import dynamic from 'next/dynamic'
import {
	SkeletonCommunityVoices,
	SkeletonHero,
	SkeletonSuccessStories,
} from '~/components/sections/impact/skeletons'

const Hero = dynamic(
	() => import('~/components/sections/community/hero').then((mod) => mod.Hero),
	{
		ssr: true,
		loading: SkeletonHero,
	},
)

const TopInvestors = dynamic(
	() =>
		import('~/components/sections/community/top-investors').then(
			(mod) => mod.TopInvestors,
		),
	{
		ssr: true,
		loading: SkeletonSuccessStories,
	},
)

const BecomeInvestor = dynamic(
	() =>
		import('~/components/sections/community/become-top-investor').then(
			(mod) => mod.BecomeInvestor,
		),
	{
		ssr: true,
		loading: SkeletonCommunityVoices,
	},
)

export function InvestorsDashboard() {
	return (
		<>
			<Hero />
			<TopInvestors />
			<BecomeInvestor />
		</>
	)
}
