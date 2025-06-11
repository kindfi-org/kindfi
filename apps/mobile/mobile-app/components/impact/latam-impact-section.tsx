import { LinearGradient } from 'expo-linear-gradient'
import {
	CheckCircle,
	DollarSign,
	Eye,
	type LucideIcon,
	Shield,
	TrendingUp,
	Users,
} from 'lucide-react-native'
import { MotiView } from 'moti'
import React, { useRef, useState, useEffect } from 'react'
import {
	Dimensions,
	FlatList,
	Pressable,
	Text as RNText,
	View,
} from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { Text } from '../Themed'
import { Box } from '../ui/box'
import { GradientText } from '../ui/gradientText'
import ImpactFeatureCard from './impact-feature-card'
import ImpactStat from './impact-stat'

// Responsive design constants
const getResponsiveLayout = () => {
	const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
	const isTablet = screenWidth >= 768
	const isLandscape = screenWidth > screenHeight

	// Dynamic padding based on screen size
	const CARD_PADDING = isTablet ? 32 : screenWidth < 375 ? 12 : 16
	const CARD_WIDTH = screenWidth - CARD_PADDING * 2

	return {
		screenWidth,
		CARD_PADDING,
		CARD_WIDTH,
		isTablet,
		isLandscape,
	}
}

type FeatureCardData = {
	id: string
	icon: LucideIcon
	title: string
	description: string
	stat?: string
	bulletPoints?: string[]
	iconColor: string
	backgroundColor: string
}

const featureCardsData: FeatureCardData[] = [
	{
		id: '1',
		icon: CheckCircle,
		title: 'Every Contribution, Recorded On-Chain',
		description: 'Complete transparency with immutable transaction records',
		stat: '$1.7B in regional funding tracked annually',
		iconColor: 'success-600',
		backgroundColor: 'bg-green-100',
	},
	{
		id: '2',
		icon: Shield,
		title: 'Every Project, Fully Reviewed',
		description: 'Rigorous vetting process ensures legitimate impact projects',
		stat: '100% of campaigns undergo milestone verification',
		iconColor: 'blue-600',
		backgroundColor: 'bg-blue-100',
	},
	{
		id: '3',
		icon: TrendingUp,
		title: 'From Crypto to Real Change',
		description: 'Transforming digital contributions into measurable impact',
		bulletPoints: [
			'Real-Time Impact Metrics',
			'Proof-backed fund releases',
			'Transparent governance',
			'Built on Stellar smart contracts',
		],
		iconColor: 'orange-600',
		backgroundColor: 'bg-orange-100',
	},
]

export function LatamImpactSection() {
	const [currentIndex, setCurrentIndex] = useState(0)
	const flatListRef = useRef<FlatList>(null)

	// Get responsive layout values
	const { screenWidth, CARD_PADDING, isTablet } = getResponsiveLayout()

	// Keyboard navigation (for external keyboard support on mobile)
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.key === 'ArrowLeft' && currentIndex > 0) {
				scrollToIndex(currentIndex - 1)
			} else if (
				event.key === 'ArrowRight' &&
				currentIndex < featureCardsData.length - 1
			) {
				scrollToIndex(currentIndex + 1)
			}
		}

		// Add keyboard event listener
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeyPress)
			return () => window.removeEventListener('keydown', handleKeyPress)
		}
	}, [currentIndex])

	const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const contentOffset = event.nativeEvent.contentOffset.x
		const index = Math.round(contentOffset / screenWidth)
		if (
			index !== currentIndex &&
			index >= 0 &&
			index < featureCardsData.length
		) {
			setCurrentIndex(index)
		}
	}

	const scrollToIndex = (index: number) => {
		if (
			index >= 0 &&
			index < featureCardsData.length &&
			index !== currentIndex
		) {
			// Use scrollToOffset instead of scrollToIndex for better compatibility with pagingEnabled
			const offsetX = index * screenWidth
			flatListRef.current?.scrollToOffset({ offset: offsetX, animated: true })
			setCurrentIndex(index)
		}
	}

	const renderFeatureCard = ({
		item,
		index,

		<View style={{ width: screenWidth, paddingHorizontal: CARD_PADDING }}>
			<MotiView
				from={{ opacity: 0, translateY: 50 }}
				animate={{ opacity: 1, translateY: 0 }}
				transition={{ type: 'timing', duration: 600, delay: 200 + index * 200 }}
			>
				<ImpactFeatureCard
					icon={item.icon}
					title={item.title}
					description={item.description}
					stat={item.stat}
					bulletPoints={item.bulletPoints}
					iconColor={item.iconColor}
					backgroundColor={item.backgroundColor}
					isActive={index === currentIndex}
				/>
			</MotiView>
		</View>
	)

	const renderDotIndicators = () => (
		<View className="flex-row justify-center items-center mt-6 gap-2">
			{featureCardsData.map((_, index) => (
				<Pressable
					key={index}
					onPress={() => scrollToIndex(index)}
					style={{
						width: isTablet ? 12 : 10,
						height: isTablet ? 12 : 10,
						borderRadius: isTablet ? 6 : 5,
						backgroundColor: index === currentIndex ? '#16a34a' : '#d1d5db',
						transform: [{ scale: index === currentIndex ? 1.25 : 1 }],
					}}
				/>
			))}
		</View>
	)

	return (
		<MotiView
			from={{ opacity: 0, translateY: 50 }}
			animate={{ opacity: 1, translateY: 0 }}
			transition={{ type: 'timing', duration: 800 }}
			className="w-full py-8"
		>
			<View className="mb-8" style={{ paddingHorizontal: CARD_PADDING }}>
				<Text className="text-3xl font-bold text-center text-gray-800 mb-4">
					Transforming Social Impact in{' '}
					<GradientText
						style={{ fontSize: isTablet ? 32 : 28, fontWeight: 'bold' }}
					>
						LATAM
					</GradientText>
				</Text>
				<Text className="text-3xl font-bold text-center text-gray-800 mb-4">
					With Blockchain You Can{' '}
					<GradientText
						style={{ fontSize: isTablet ? 32 : 28, fontWeight: 'bold' }}
					>
						Trust
					</GradientText>
				</Text>
				<Text className="text-base text-gray-600 text-center leading-6 px-2">
					KindFi's Stellar-based escrow system ensures every contribution
					reaches verified projects through milestone-validated releases,
					creating unprecedented transparency in social impact funding.
				</Text>
			</View>

			<View className="mb-8">
				<FlatList
					ref={flatListRef}
					data={featureCardsData}
					renderItem={renderFeatureCard}
					keyExtractor={(item) => item.id}
					horizontal
					showsHorizontalScrollIndicator={false}
					pagingEnabled={true}
					snapToInterval={screenWidth}
					snapToAlignment="center"
					decelerationRate="fast"
					onScroll={onScroll}
					scrollEventThrottle={32}
					bounces={false}
					overScrollMode="never"
					onMomentumScrollEnd={onScroll}
				/>
				{renderDotIndicators()}
			</View>

			<MotiView
				from={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ type: 'timing', duration: 700, delay: 800 }}
				className="mb-8"
				style={{ paddingHorizontal: CARD_PADDING }}
			>
				<View className="bg-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
					<View className="items-center mb-5">
						<Box className="rounded-full bg-green-200 w-14 h-14 items-center justify-center mb-3">
							<Users color="#16a34a" size={28} />
						</Box>
						<Text className="text-gray-900 text-xl font-bold text-center">
							Real Progress, Real Accountability
						</Text>
					</View>

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

			<View
				className="flex-row gap-3"
				style={{ paddingHorizontal: CARD_PADDING }}
			>
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
