'use client'

import { MotiView } from 'moti'
import { Pressable, Text, View } from 'react-native'

interface MissionBlockProps {
	onJoinPress?: () => void
	onDiscoverPress?: () => void
	animationDelay?: number
	buttonAnimationDelay?: number
}

export default function MissionBlock({
	onJoinPress,
	onDiscoverPress,
	animationDelay = 1200,
	buttonAnimationDelay = 400,
}: MissionBlockProps) {
	return (
		<MotiView
			from={{ opacity: 0, translateY: 20 }}
			animate={{ opacity: 1, translateY: 0 }}
			transition={{ type: 'timing', duration: 800, delay: animationDelay }}
			className="mx-4 my-8 bg-white rounded-xl p-6 shadow-md"
			style={{ elevation: 3 }}
		>
			<Text className="text-2xl font-bold text-center text-gray-900 mb-4">
				KindFi: One Wallet. One Blockchain. One World. Real Change.
			</Text>

			<Text className="text-gray-700 mb-4 leading-6">
				At KindFi, we're building more than a platform — we're building a
				movement. Powered by the Stellar blockchain, KindFi turns a single
				wallet into a gateway for global impact.
			</Text>

			<Text className="text-gray-700 mb-4 leading-6">
				From clean water to children education and animal rescue, every verified
				campaign is fueled by real people, transparent tech, and milestone-based
				trust. Join us as we prove that one contribution, made securely and
				transparently, can change lives.
			</Text>

			<Text className="text-green-600 font-medium text-center mb-6 leading-6">
				This is social impact reimagined — where every wallet is a voice for
				good.
			</Text>

			<View className="flex-row flex-wrap justify-center space-y-4 md:space-y-0 md:space-x-4">
				<MotiView
					from={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{
						type: 'timing',
						duration: 600,
						delay: animationDelay + buttonAnimationDelay,
					}}
					className="w-full md:w-auto"
				>
					<Pressable
						onPress={
							onJoinPress || (() => console.log('Tapped Join the Change'))
						}
						className="bg-gradient-to-r from-green-600 to-blue-800 py-3 px-6 rounded-full items-center"
						accessibilityLabel="Join the Change"
						accessibilityRole="button"
					>
						<Text className="text-white font-semibold text-center">
							Join the Change
						</Text>
					</Pressable>
				</MotiView>

				<MotiView
					from={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{
						type: 'timing',
						duration: 600,
						delay: animationDelay + buttonAnimationDelay + 200,
					}}
					className="w-full md:w-auto"
				>
					<Pressable
						onPress={
							onDiscoverPress ||
							(() => console.log('Tapped Discover more about KindFi'))
						}
						className="border border-green-600 py-3 px-6 rounded-full items-center"
						accessibilityLabel="Discover more about KindFi"
						accessibilityRole="button"
					>
						<Text className="text-green-600 font-semibold text-center">
							Discover more about KindFi
						</Text>
					</Pressable>
				</MotiView>
			</View>
		</MotiView>
	)
}
