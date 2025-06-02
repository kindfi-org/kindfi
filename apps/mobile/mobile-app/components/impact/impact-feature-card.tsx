import type { LucideIcon } from 'lucide-react-native'
import React from 'react'
import { Pressable, View } from 'react-native'
import { getThemeColor } from '../../constants/theme-colors'
import { Text } from '../Themed'
import { Box } from '../ui/box'
import { Icon } from '../ui/icon'

type ImpactFeatureCardProps = {
	icon: LucideIcon
	title: string
	description: string
	stat?: string
	bulletPoints?: string[]
	iconColor?: string
	backgroundColor?: string
	onPress?: () => void
}

function ImpactFeatureCard({
	icon,
	title,
	description,
	stat,
	bulletPoints,
	iconColor = '#10b981',
	backgroundColor = 'bg-white',
	onPress,
}: ImpactFeatureCardProps) {
	const CardWrapper = onPress ? Pressable : View

	return (
		<CardWrapper onPress={onPress} className="w-full">
			<Box
				className={`${backgroundColor} rounded-xl p-6 shadow-md border border-gray-100 items-center text-center`}
			>
				{/* Icon */}
				<View className="items-center mb-4">
					<Box className="rounded-full bg-white w-12 h-12 items-center justify-center shadow-sm">
						<Icon
							as={icon}
							height={24}
							width={24}
							color={getThemeColor(iconColor)}
						/>
					</Box>
				</View>

				{/* Title */}
				<Text
					className="font-bold text-lg text-gray-800 text-center mb-3"
					numberOfLines={2}
				>
					{title}
				</Text>

				{/* Description */}
				<Text className="text-base text-gray-600 leading-6 text-center mb-5">
					{description}
				</Text>

				{/* Stat or Bullet Points */}
				{stat && (
					<View className="bg-white/70 rounded-lg p-3 w-full">
						<Text className="text-sm font-semibold text-gray-700 text-center">
							{stat}
						</Text>
					</View>
				)}

				{bulletPoints && (
					<View className="bg-white/70 rounded-lg p-3 w-full">
						{bulletPoints.map((point, index) => (
							<View
								key={`bullet-${point.substring(0, 10)}-${index}`}
								className="flex-row items-center justify-center mb-1.5 last:mb-0"
							>
								<View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
								<Text className="text-sm text-gray-700 font-medium text-center flex-1">
									{point}
								</Text>
							</View>
						))}
					</View>
				)}
			</Box>
		</CardWrapper>
	)
}

export default ImpactFeatureCard
