import { MotiView } from 'moti'
import React, { useState } from 'react'
import { type LayoutChangeEvent, Pressable, View } from 'react-native'
import { HStack } from '../ui/hstack'
import { Text } from '../ui/text'
import { VStack } from '../ui/vstack'

interface OnboardingToggleProps {
	activeTab: 'kindlers' | 'kinders'
	onTabChange: (tab: 'kindlers' | 'kinders') => void
}

export function OnboardingToggle({
	activeTab,
	onTabChange,
}: OnboardingToggleProps) {
	const [containerWidth, setContainerWidth] = useState(0)

	const handleLayout = (event: LayoutChangeEvent) => {
		const { width } = event.nativeEvent.layout
		setContainerWidth(width)
	}

	const slideWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0
	const slidePosition = activeTab === 'kindlers' ? 4 : slideWidth + 4

	return (
		<MotiView
			from={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ type: 'timing', duration: 800, delay: 900 }}
		>
			<VStack className="w-full mb-8">
				<View
					className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 relative w-full max-w-md mx-auto"
					onLayout={handleLayout}
				>
					{containerWidth > 0 && (
						<MotiView
							className="absolute bg-white dark:bg-gray-700 rounded-xl "
							animate={{
								left: slidePosition,
							}}
							transition={{
								type: 'timing',
								duration: 300,
							}}
							style={{
								width: slideWidth,
								height: '100%',
								position: 'absolute',
								top: 4,
								bottom: 4,
								zIndex: 1,
							}}
						/>
					)}

					<HStack className="relative z-10">
						<Pressable
							onPress={() => onTabChange('kindlers')}
							className="flex-1 py-4 px-6"
						>
							<Text
								className={`text-center font-semibold text-sm ${
									activeTab === 'kindlers'
										? 'text-blue-600 dark:text-blue-400'
										: 'text-gray-600 dark:text-gray-400'
								}`}
							>
								For Kindlers
							</Text>
						</Pressable>

						<Pressable
							onPress={() => onTabChange('kinders')}
							className="flex-1 py-4 px-6"
						>
							<Text
								className={`text-center font-semibold text-sm ${
									activeTab === 'kinders'
										? 'text-blue-600 dark:text-blue-400'
										: 'text-gray-600 dark:text-gray-400'
								}`}
							>
								For Kinders
							</Text>
						</Pressable>
					</HStack>
				</View>
			</VStack>
		</MotiView>
	)
}
