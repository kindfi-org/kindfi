import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import type React from 'react'
import { Text, type TextProps, View } from 'react-native'

interface AnimatedTextProps {
	text: string
	textClassName?: TextProps['className']
	delay?: number
	duration?: number
	className?: string
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
	text,
	textClassName,
	delay = 0,
	className = '',
}) => {
	return (
		<MotiView
			from={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ type: 'timing', duration: 500, delay }}
			className={className}
		>
			<Text className={textClassName}>{text}</Text>
		</MotiView>
	)
}

export const GradientText: React.FC<AnimatedTextProps> = ({
	text,
	textClassName,
	delay = 0,
	className = '',
}) => {
	return (
		<MotiView
			from={{ opacity: 0, translateY: 10 }}
			animate={{ opacity: 1, translateY: 0 }}
			transition={{ type: 'timing', duration: 600, delay }}
			className={className}
		>
			<MaskedView maskElement={<Text className={textClassName}>{text}</Text>}>
				<LinearGradient
					colors={['rgb(23, 143, 75)', 'rgb(29, 34, 74)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
				>
					<Text className={`${textClassName} opacity-0`}>{text}</Text>
				</LinearGradient>
			</MaskedView>
		</MotiView>
	)
}

export const AnimatedCharacters: React.FC<AnimatedTextProps> = ({
	text,
	textClassName,
	delay = 0,
	duration = 30,
	className = '',
}) => {
	const characters = text.split('')

	return (
		<View className={`flex-row flex-wrap justify-center ${className}`}>
			{characters.map((char, index) => (
				<MotiView
					key={`${char}-key`}
					from={{ opacity: 0, translateY: 10 }}
					animate={{ opacity: 1, translateY: 0 }}
					transition={{
						type: 'timing',
						duration: 300,
						delay: delay + index * duration,
					}}
				>
					<Text className={textClassName}>
						{char === ' ' ? '\u00A0' : char}
					</Text>
				</MotiView>
			))}
		</View>
	)
}
