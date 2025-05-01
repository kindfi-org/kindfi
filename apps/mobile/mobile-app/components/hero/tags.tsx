'use client'

import { MotiView } from 'moti'
import type React from 'react'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Easing } from 'react-native-reanimated'

interface AnimatedTagProps {
	icon: React.ReactNode
	label: string
	bgColor?: string
	textColor?: string
	delay?: number
	onPress?: () => void
}

export const AnimatedTag: React.FC<AnimatedTagProps> = ({
	icon,
	label,
	bgColor = '#E8F5E9',
	textColor = '#2E7D32',
	delay = 0,
	onPress = () => {},
}) => {
	const [isPressed, setIsPressed] = useState(false)

	return (
		<MotiView
			from={{ opacity: 0, scale: 0.5, translateY: 20 }}
			animate={{ opacity: 1, scale: 1, translateY: 0 }}
			transition={{
				type: 'timing',
				duration: 600,
				delay,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			}}
			style={{ marginRight: 8, marginBottom: 8 }}
		>
			<Pressable
				onPressIn={() => setIsPressed(true)}
				onPressOut={() => setIsPressed(false)}
				onPress={onPress}
			>
				<MotiView
					animate={{
						scale: isPressed ? 1.1 : 1,
						translateY: isPressed ? -5 : 0,
					}}
					transition={{
						type: 'timing',
						duration: 200,
					}}
				>
					<View
						className={`rounded-full px-4 py-2 border border-gray-100 shadow-sm ${isPressed ? 'shadow-md' : ''}`}
						style={{ backgroundColor: bgColor }}
					>
						<View className="flex-row items-center">
							<MotiView
								animate={{
									rotate: isPressed ? '10deg' : '0deg',
									scale: isPressed ? 1.2 : 1,
								}}
								transition={{
									type: 'timing',
									duration: 200,
								}}
							>
								{icon}
							</MotiView>
							<MotiView
								animate={{
									translateX: isPressed ? 3 : 0,
								}}
								transition={{
									type: 'timing',
									duration: 200,
								}}
							>
								<Text
									className="ml-2 text-sm font-medium"
									style={{ color: textColor }}
								>
									{label}
								</Text>
							</MotiView>
						</View>
					</View>
				</MotiView>
			</Pressable>
		</MotiView>
	)
}
