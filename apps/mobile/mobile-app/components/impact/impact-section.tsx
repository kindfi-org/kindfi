import { ArrowUpRight, Megaphone, RefreshCcw } from 'lucide-react-native'
import React from 'react'
import { Text, View } from '../Themed'
import { GradientText } from '../ui/gradientText'
import ImpactCard from './impact-card'
function ImpactSection() {
	return (
		<View className="flex-1 p-5 h-full gap-5   items-center justify-center  w-full bg-background-light">
			<View className=" items-center justify-center ">
				<Text
					lightColor="gradient-text"
					className="gradient-text  text-center text-2xl font-bold mb-2"
				>
					Join The{' '}
					<GradientText style={{ fontSize: 20, fontWeight: 'bold' }}>
						Kind{'  '}
					</GradientText>
					Fi Movement:
					<GradientText style={{ fontSize: 20, fontWeight: 'bold' }}>
						Support Change.
					</GradientText>
				</Text>
				<Text className="text-success-300 text-2xl font-bold mb-2">
					<GradientText style={{ fontSize: 20, fontWeight: 'bold' }}>
						Earn Trust. {'  '}
					</GradientText>
					{'  '}
					<Text>Build Impact</Text>
				</Text>
			</View>
			<Text className="text-typography-gray text-center text-base mb-4">
				KindFi is more than a platform - it's a new way to fund the real change.
				Whether you're a cause creator or a supporter, every action you take
				earns trust, builds your on-chain reputation, and strenghtens a
				transprarent, community-led ecosystem
			</Text>

			{impact_data.map((items) => {
				return (
					<ImpactCard
						key={items.title.replace(/\s+/g, '-').toLowerCase()}
						icon={items.icon}
						title={items.title}
						description={items.description}
						linkText={items.linkText}
						linkHref={items.linkHref}
						iconColor={items.iconColor}
					/>
				)
			})}
		</View>
	)
}

export default ImpactSection

const impact_data = [
	{
		icon: ArrowUpRight,
		title: 'Give with purpose, earn with impact',
		description:
			'Support verified projects, grow your Kinders NFT, and unlock governance right, exclusive campaigns, and rewards. Every donation contributes to your on-chain identity and moves the ecosystem forward.',
		linkText: 'View Verified Projects >',
		linkHref: '/projects',
		iconColor: 'success-500',
	},
	{
		icon: RefreshCcw,
		title: 'Fuel the Causes That Matter Most',
		description:
			'Discover social, environmental, and humanitarian projects across LATAM and beyond. All Campaigns are milestones-verified and trustless fund release, earning your impact is real and trackable',
		linkText: 'View Verified Projects >',
		linkHref: '/projects',
		iconColor: 'typography-400',
	},
	{
		icon: Megaphone,
		title: 'Become a steward of change',
		description:
			"With KindFi, supporters aren't just donors - they're governors. Your on-chain activity earns you the right to help shape how community funds are allocated, and what causes rise next",
		linkText: 'View Verified Projects >',
		linkHref: '/projects',
		iconColor: 'indicator-info',
	},
]
