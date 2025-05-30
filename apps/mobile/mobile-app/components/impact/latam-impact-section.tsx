import { LinearGradient } from 'expo-linear-gradient'
import {
	CheckCircle,
	DollarSign,
	Eye,
	Shield,
	TrendingUp,
	Users,
} from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Text as RNText, View } from 'react-native'
import { Text } from '../Themed'
import { Box } from '../ui/box'
import { GradientText } from '../ui/gradientText'
import ImpactFeatureCard from './impact-feature-card'
import ImpactStat from './impact-stat'

export function LatamImpactSection() {
	return (
		<MotiView
			from={{ opacity: 0, translateY: 50 }}
			animate={{ opacity: 1, translateY: 0 }}
			transition={{ type: 'timing', duration: 800 }}
			className="w-full px-4 py-8"
		>
			{/* Section Title & Description */}
			<View className="mb-8">
				<Text className="text-3xl font-bold text-center text-gray-800 mb-4">
					Transforming Social Impact in{' '}
					<GradientText style={{ fontSize: 28, fontWeight: 'bold' }}>
						LATAM
					</GradientText>
				</Text>
				<Text className="text-3xl font-bold text-center text-gray-800 mb-4">
					With Blockchain You Can{' '}
					<GradientText style={{ fontSize: 28, fontWeight: 'bold' }}>
						Trust
					</GradientText>
				</Text>
				<Text className="text-base text-gray-600 text-center leading-6 px-2">
					KindFi's Stellar-based escrow system ensures every contribution
					reaches verified projects through milestone-validated releases,
					creating unprecedented transparency in social impact funding.
				</Text>
			</View>

			{/* Feature Cards - Top Row */}
			<View className="mb-8 gap-4">
				<MotiView
					from={{ opacity: 0, translateX: -50 }}
					animate={{ opacity: 1, translateX: 0 }}
					transition={{ type: 'timing', duration: 600, delay: 200 }}
				>
					<ImpactFeatureCard
						icon={CheckCircle}
						title="Every Contribution, Recorded On-Chain"
						description="Complete transparency with immutable transaction records"
						stat="$1.7B in regional funding tracked annually"
						iconColor="success-600"
						backgroundColor="bg-green-100"
					/>
				</MotiView>

				<MotiView
					from={{ opacity: 0, translateX: 50 }}
					animate={{ opacity: 1, translateX: 0 }}
					transition={{ type: 'timing', duration: 600, delay: 400 }}
				>
					<ImpactFeatureCard
						icon={Shield}
						title="Every Project, Fully Reviewed"
						description="Rigorous vetting process ensures legitimate impact projects"
						stat="100% of campaigns undergo milestone verification"
						iconColor="blue-600"
						backgroundColor="bg-blue-100"
					/>
				</MotiView>

				<MotiView
					from={{ opacity: 0, translateX: -50 }}
					animate={{ opacity: 1, translateX: 0 }}
					transition={{ type: 'timing', duration: 600, delay: 600 }}
				>
					<ImpactFeatureCard
						icon={TrendingUp}
						title="From Crypto to Real Change"
						description="Transforming digital contributions into measurable impact"
						bulletPoints={[
							'Real-Time Impact Metrics',
							'Proof-backed fund releases',
							'Transparent governance',
							'Built on Stellar smart contracts',
						]}
						iconColor="orange-600"
						backgroundColor="bg-orange-100"
					/>
				</MotiView>
			</View>

			{/* Central Explainer Block */}
			<MotiView
				from={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ type: 'timing', duration: 700, delay: 800 }}
				className="mb-8"
			>
				<View className="bg-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
					{/* Header Section */}
					<View className="items-center mb-5">
						<Box className="rounded-full bg-green-200 w-14 h-14 items-center justify-center mb-3">
							<Users color="#16a34a" size={28} />
						</Box>
						<Text className="text-gray-900 text-xl font-bold text-center">
							Real Progress, Real Accountability
						</Text>
					</View>

					{/* Main Content */}
					<View className="mb-5">
						<Text className="text-gray-700 text-base leading-6 text-center mb-4">
							Unlike traditional crowdfunding, KindFi releases funds only when
							projects hit verified milestones.
						</Text>
						<Text className="text-gray-600 text-sm leading-5 text-center">
							Our blockchain infrastructure ensures every peso reaches its
							intended purpose, creating a new standard of trust in social
							impact.
						</Text>
					</View>

					{/* Feature Points */}
					<View className="bg-white/70 rounded-xl p-4 border border-green-100">
						<View className="flex-row items-center justify-center flex-wrap gap-1">
							<View className="flex-row items-center mr-3 mb-2">
								<CheckCircle color="#16a34a" size={14} />
								<Text className="text-green-800 font-medium ml-1 text-xs">
									Milestone-based releases
								</Text>
							</View>
							<View className="flex-row items-center mr-3 mb-2">
								<CheckCircle color="#16a34a" size={14} />
								<Text className="text-green-800 font-medium ml-1 text-xs">
									Zero hidden fees
								</Text>
							</View>
							<View className="flex-row items-center mb-2">
								<CheckCircle color="#16a34a" size={14} />
								<Text className="text-green-800 font-medium ml-1 text-xs">
									Complete transparency
								</Text>
							</View>
						</View>
					</View>
				</View>
			</MotiView>

			{/* Impact Stats - Bottom Row */}
			<View className="flex-row gap-3">
				<MotiView
					from={{ opacity: 0, translateY: 30 }}
					animate={{ opacity: 1, translateY: 0 }}
					transition={{ type: 'timing', duration: 500, delay: 1000 }}
					className="flex-1"
				>
					<ImpactStat
						icon={CheckCircle}
						value="100%"
						label="Verified Projects"
						iconColor="success-600"
						backgroundColor="bg-green-100"
					/>
				</MotiView>

				<MotiView
					from={{ opacity: 0, translateY: 30 }}
					animate={{ opacity: 1, translateY: 0 }}
					transition={{ type: 'timing', duration: 500, delay: 1200 }}
					className="flex-1"
				>
					<ImpactStat
						icon={DollarSign}
						value="0%"
						label="Hidden Fees"
						iconColor="blue-600"
						backgroundColor="bg-blue-100"
					/>
				</MotiView>

				<MotiView
					from={{ opacity: 0, translateY: 30 }}
					animate={{ opacity: 1, translateY: 0 }}
					transition={{ type: 'timing', duration: 500, delay: 1400 }}
					className="flex-1"
				>
					<ImpactStat
						icon={Eye}
						value="24/7"
						label="Project Transparency"
						iconColor="orange-600"
						backgroundColor="bg-orange-100"
					/>
				</MotiView>
			</View>
		</MotiView>
	)
}

export default LatamImpactSection
