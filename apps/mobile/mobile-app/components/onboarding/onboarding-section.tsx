import { MotiView } from 'moti'
import React, { useState, useRef } from 'react'
import { Button, ButtonText } from '../ui/button'
import { Text } from '../ui/text'
import { VStack } from '../ui/vstack'
import { OnboardingToggle } from './onboarding-toggle'
import { StepCard } from './step-card'
import { Animated, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native'


interface Step {
	number: number
	title: string
	description: string
}

const kindlersSteps: Step[] = [
	{
		number: 1,
		title: 'Create Your Project',
		description:
			'Define your cause, set funding goals, and outline the impact you want to make in your community.',
	},
	{
		number: 2,
		title: 'Build Your Campaign',
		description:
			'Add compelling visuals, detailed descriptions, and transparent budget breakdowns to inspire supporters.',
	},
	{
		number: 3,
		title: 'Launch & Share',
		description:
			'Publish your project and share it across social networks to reach potential supporters worldwide.',
	},
	{
		number: 4,
		title: 'Engage Your Community',
		description:
			'Respond to supporters, provide updates, and build lasting relationships with your contributor base.',
	},
	{
		number: 5,
		title: 'Deliver Impact',
		description:
			'Execute your project, track progress, and share the positive outcomes with your supporters.',
	},
]

const kindersSteps: Step[] = [
	{
		number: 1,
		title: 'Discover Projects',
		description:
			'Browse through carefully curated causes and projects that align with your values and interests.',
	},
	{
		number: 2,
		title: 'Learn & Connect',
		description:
			'Read project details, watch videos, and connect directly with project creators to ask questions.',
	},
	{
		number: 3,
		title: 'Choose Your Support',
		description:
			'Select from various contribution levels and reward tiers that match your budget and preferences.',
	},
	{
		number: 4,
		title: 'Make Secure Contributions',
		description:
			'Support projects safely using our blockchain-powered platform with transparent transaction tracking.',
	},
	{
		number: 5,
		title: 'Track Your Impact',
		description:
			'Follow project progress, receive updates, and see the real-world impact of your contributions.',
	},
]

export function OnboardingSection() {
	const [activeTab, setActiveTab] = useState<'kindlers' | 'kinders'>('kindlers')
	const [currentStepIndex, setCurrentStepIndex] = useState(0)

	const scrollViewRef = useRef<ScrollView>(null)
	const screenHeight = Dimensions.get('window').height;

	const scrollY = useRef(new Animated.Value(0)).current

	const currentSteps = activeTab === 'kindlers' ? kindlersSteps : kindersSteps
	const ctaText =
		activeTab === 'kindlers' ? 'Register Your Project' : 'Explore Causes'

	const handleTabChange = (tab: 'kindlers' | 'kinders') => {
		setActiveTab(tab)
		scrollViewRef.current?.scrollTo({ y: 0, animated: true })
	}

	const handleCtaPress = () => {
		// Navigation logic will be implemented when routing is set up
		console.log(
			`Navigate to ${activeTab === 'kindlers' ? 'project registration' : 'causes browser'}`,
		)
	}

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const offsetY = event.nativeEvent.contentOffset.y
		const index = Math.round(offsetY / screenHeight)
		setCurrentStepIndex(index - 1) // -1 because hero is first
	}

	const titleScale = scrollY.interpolate({
		inputRange: [0, 200],
		outputRange: [1, 0.8],
		extrapolate: 'clamp',
	})

	const descOpacity = scrollY.interpolate({
		inputRange: [0, 150],
		outputRange: [1, 0],
		extrapolate: 'clamp',
	})

	return (
		<Animated.ScrollView
			ref={scrollViewRef}
			pagingEnabled
			snapToInterval={screenHeight}
			decelerationRate="fast"
			snapToAlignment="start"
			showsVerticalScrollIndicator={false}
			onScroll={Animated.event(
				[{ nativeEvent: { contentOffset: { y: scrollY } } }],
				{ useNativeDriver: false, listener: handleScroll }
			)}
			scrollEventThrottle={16}
			className="flex-1 bg-gray-50 dark:bg-gray-900"
		>
			{/* Hero Section */}
			<Animated.View style={{ height: screenHeight, justifyContent: 'center', paddingHorizontal: 24 }}>
				<VStack space="lg" className="items-center my-[5rem]">
					<Animated.Text
						style={{ transform: [{ scale: titleScale }] }}
						className="text-4xl font-bold text-center text-gray-900 dark:text-white"
					>
						How KindFi Works
					</Animated.Text>
					<Animated.Text
						style={{ opacity: descOpacity }}
						className="text-lg text-center text-gray-600 dark:text-gray-300 max-w-xl"
					>
						Whether you're creating positive change or supporting meaningful
						causes, KindFi makes it simple to make a difference.
					</Animated.Text>
				</VStack>

				<OnboardingToggle activeTab={activeTab} onTabChange={handleTabChange} />
			</Animated.View>

			{/* Steps */}
			{currentSteps.map((step, index) => (
				<StepCard
					key={`${activeTab}-${step.number}`}
					step={step}
					index={index}
					total={currentSteps.length}
					currentIndex={currentStepIndex}
				/>
			))}

			{/* CTA */}
			<VStack space="md" className="items-center my-8">
				<Button
					onPress={() => console.log(ctaText)}
					size="lg"
					action="primary"
					className="px-8 py-4 rounded-xl min-w-64 h-18"
				>
					<ButtonText className="font-semibold text-lg ">{ctaText}</ButtonText>
				</Button>
			</VStack>
		</Animated.ScrollView>
	)
}
