import { Text } from '@/components/ui/text'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'

interface GradientTextProps {
	text: string
	className?: string
}

export const GradientText = ({ text, className = '' }: GradientTextProps) => (
	<MaskedView
		maskElement={
			<Text className={`${className}`} style={{ opacity: 1 }}>
				{text}
			</Text>
		}
	>
		<LinearGradient
			colors={['#7cc242', '#1a2b26']}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 0 }}
		>
			<Text className={`${className} opacity-0`}>{text}</Text>
		</LinearGradient>
	</MaskedView>
)
