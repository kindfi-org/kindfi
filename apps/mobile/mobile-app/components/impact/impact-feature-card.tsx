import type { LucideIcon } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'
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
	isActive?: boolean
}

// Helper function to convert Tailwind background classes to actual colors
const getBackgroundColor = (bgClass: string): string => {
	switch (bgClass) {
		case 'bg-green-100':
			return '#dcfce7'
		case 'bg-blue-100':
			return '#dbeafe'
		case 'bg-orange-100':
			return '#fed7aa'
		default:
			return '#ffffff'
	}
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
	isActive = true,
}: ImpactFeatureCardProps) {
	const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.4)).current

	useEffect(() => {
		Animated.timing(opacityAnim, {
			toValue: isActive ? 1 : 0.4,
			duration: 300,
			useNativeDriver: true,
		}).start()
	}, [isActive, opacityAnim])

	return (
		<Animated.View className="w-full" style={{ opacity: opacityAnim }}>
			<View
				style={{
					backgroundColor: getBackgroundColor(backgroundColor),
					borderRadius: 12,
					padding: 24,
					borderWidth: 1,
					borderColor: '#f3f4f6',
					alignItems: 'center',
					minHeight: 360,
					justifyContent: 'flex-start',
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.1,
					shadowRadius: 8,
					elevation: 4,
				}}
			>
				<View style={{ alignItems: 'center', marginBottom: 24 }}>
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

					<Text
						className="font-bold text-lg text-gray-800 text-center mb-3"
						numberOfLines={2}
					>
						{title}
					</Text>

					<Text className="text-base text-gray-600 leading-6 text-center">
						{description}
					</Text>
				</View>

				<View style={{ width: '100%' }}>
					{stat && (
						<View
							style={{
								backgroundColor: 'rgba(255, 255, 255, 0.7)',
								borderRadius: 8,
								padding: 12,
								width: '100%',
							}}
						>
							<Text className="text-sm font-semibold text-gray-700 text-center">
								{stat}
							</Text>
						</View>
					)}

					{bulletPoints && (
						<View
							style={{
								backgroundColor: 'rgba(255, 255, 255, 0.7)',
								borderRadius: 8,
								padding: 12,
								width: '100%',
							}}
						>
							{bulletPoints.map((point, index) => (
								<View
									key={`bullet-${point.substring(0, 10)}-${index}`}
									className="flex-row items-center"
									style={{
										marginBottom: index === bulletPoints.length - 1 ? 0 : 8,
									}}
								>
									<View
										style={{
											width: 6,
											height: 6,
											borderRadius: 3,
											backgroundColor: '#22c55e',
											marginRight: 8,
										}}
									/>
									<Text className="text-sm text-gray-700 font-medium flex-1">
										{point}
									</Text>
								</View>
							))}
						</View>
					)}
				</View>
			</View>
		</Animated.View>
	)
}

export default ImpactFeatureCard
