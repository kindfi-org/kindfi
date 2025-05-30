import React from 'react'
import { Pressable, View } from 'react-native'
import { Text } from '../Themed'
import { Box } from '../ui/box'
import { Icon } from '../ui/icon'

type ImpactStatProps = {
	icon: any // Icon component from lucide-react-native
	value: string
	label: string
	iconColor?: string
	backgroundColor?: string
	onPress?: () => void
}

function ImpactStat({
	icon,
	value,
	label,
	iconColor = '#10b981', // Default green color
	backgroundColor = 'bg-white',
	onPress,
}: ImpactStatProps) {
	const CardWrapper = onPress ? Pressable : View

	// Color mapping for reliable colors
	const getIconColor = (colorName: string) => {
		const colorMap: { [key: string]: string } = {
			'success-600': '#16a34a',
			'blue-600': '#2563eb',
			'yellow-600': '#ca8a04',
			'orange-600': '#ea580c',
		}
		return colorMap[colorName] || colorName
	}

	return (
		<CardWrapper onPress={onPress} className="flex-1">
			<Box
				className={`${backgroundColor} rounded-xl p-3 shadow-sm border border-gray-100 items-center justify-between h-[130px]`}
			>
				{/* Icon */}
				<Box
					className={`rounded-full bg-white w-8 h-8 items-center justify-center shadow-sm`}
				>
					<Icon
						as={icon}
						height={18}
						width={18}
						color={getIconColor(iconColor)}
					/>
				</Box>

				{/* Value */}
				<Text className="text-2xl font-bold text-gray-800">{value}</Text>

				{/* Label */}
				<Text
					className="text-xs text-gray-600 text-center font-medium leading-3 px-1"
					numberOfLines={2}
				>
					{label}
				</Text>
			</Box>
		</CardWrapper>
	)
}

export default ImpactStat
