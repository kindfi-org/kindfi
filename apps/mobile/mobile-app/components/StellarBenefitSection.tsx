import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { MotiView } from 'moti'
import { useColorScheme } from 'nativewind'
import React from 'react'
import { ScrollView } from 'react-native'
import StellarBenefitCard from './StellarBenefitCard'

export default function StellarSection() {
	const { colorScheme } = useColorScheme()
	const isDark = colorScheme === 'dark'

	const cards = [
		{
			icon: '🛡️',
			title: 'Milestone-Based Escrow',
			description:
				'Donations are held in Stellar smart contract escrows and released only when causes meet verified milestones. It is giving, with built-in accountability — no guesswork, no misuse.',
			bullets: [
				'Verified Milestone Reviews',
				'Fund Safety Through Escrow',
				'On-Chain Transparency',
			],
			cardColor: isDark ? 'bg-blue-900' : 'bg-blue-50',
			onLearnMore: () => console.log('Learn more about Escrow'),
		},
		{
			icon: '📊',
			title: 'Measurable Results',
			description:
				'Every project shares updates, proof, and progress reports. Contributors see how funds are used, ensuring every act of kindness becomes lasting change.',
			bullets: [
				'Impact Documentation',
				'Real-Time Progress Tracking',
				'Transparent Community Stories',
			],
			cardColor: isDark ? 'bg-green-900' : 'bg-green-50',
			onLearnMore: () => console.log('Learn more about Results'),
		},
		{
			icon: '🌐',
			title: 'Built on Stellar. Made for Good.',
			description:
				'Connect your wallet, contribute in seconds, and earn on-chain recognition through Kinders NFTs. Every action is recorded, rewarded, and visible forever.',
			bullets: [
				'Fast, Low-Cost Transactions',
				'Immutable Contribution Records',
				'NFT-Based Rewards and Identity',
			],
			cardColor: isDark ? 'bg-yellow-900' : 'bg-yellow-50',
			onLearnMore: () => console.log('Learn more about Stellar'),
		},
	]

	return (
		<ScrollView
			className={isDark ? 'bg-slate-950 px-4 py-6' : 'bg-white px-4 py-6'}
		>
			<Box className="mb-6">
				<Text className="text-2xl font-bold text-center mb-2">
					Trust Built In. Impact Locked On. Powered by{' '}
					<Text className="text-primary">Stellar</Text>
				</Text>
				<Text className="text-base text-center text-gray-600 dark:text-gray-300">
					Discover how blockchain-backed tools ensure accountability,
					transparency, and measurable impact at every step.
				</Text>
			</Box>
			{cards.length === 0 && (
				<Box className="items-center justify-center py-10">
					<Text className="text-base text-center text-gray-500 dark:text-gray-400">
						Benefits information is currently unavailable
					</Text>
				</Box>
			)}

			{cards.map((card, index) => (
				<MotiView
					key={card.title}
					from={{ opacity: 0, translateY: 20 }}
					animate={{ opacity: 1, translateY: 0 }}
					transition={{ delay: index * 150, duration: 400 }}
				>
					<StellarBenefitCard {...card} />
				</MotiView>
			))}
		</ScrollView>
	)
}
