import dynamic from 'next/dynamic'
import {
	SkeletonCommunityVoices,
	SkeletonHero,
	SkeletonImpactCategories,
	SkeletonImpactMakers,
	SkeletonMakeImpact,
	SkeletonSuccessStories,
} from '~/components/sections/impact/skeletons'

const Hero = dynamic(
	() => import('~/components/sections/impact/hero').then((mod) => mod.Hero),
	{
		ssr: true,
		loading: SkeletonHero,
	},
)

const SuccessStories = dynamic(
	() =>
		import('~/components/sections/impact/success-stories').then(
			(mod) => mod.SuccessStories,
		),
	{
		ssr: true,
		loading: SkeletonSuccessStories,
	},
)

const Testimonials = dynamic(
	() =>
		import('~/components/sections/impact/testimonials').then(
			(mod) => mod.CommunityVoices,
		),
	{
		ssr: true,
		loading: SkeletonCommunityVoices,
	},
)

const TopImpactMakers = dynamic(
	() =>
		import('~/components/sections/impact/impact-makers').then(
			(mod) => mod.TopImpactMakers,
		),
	{
		ssr: true,
		loading: SkeletonImpactMakers,
	},
)

const Categories = dynamic(
	() =>
		import('~/components/sections/impact/categories').then(
			(mod) => mod.ImpactCategories,
		),
	{
		ssr: true,
		loading: SkeletonImpactCategories,
	},
)

const MakeImpact = dynamic(
	() =>
		import('~/components/sections/impact/get-involved').then(
			(mod) => mod.MakeImpact,
		),
	{
		ssr: true,
		loading: SkeletonMakeImpact,
	},
)
export function ImpactDashboard() {
	return (
		<>
			<Hero />
			<SuccessStories />
			<Testimonials />
			<TopImpactMakers />
			<Categories />
			<MakeImpact />
		</>
	)
}
