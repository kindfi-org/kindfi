import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { MotiView } from 'moti'
import React from 'react'
import { Pressable, useColorScheme } from 'react-native'

type StellarBenefitCardProps = {
	icon: string
	title: string
	description?: string
	bullets: string[]
	onLearnMore: () => void
	cardColor?: string
	iconSize?: string
}

export default function StellarBenefitCard({
	icon,
	title,
	description,
	bullets,
	onLearnMore,
	cardColor = 'bg-white',
	iconSize = 'text-2xl', //
}: StellarBenefitCardProps) {
	const scheme = useColorScheme()
	const textColor = scheme === 'dark' ? 'text-white' : 'text-black'
	const subTextColor = scheme === 'dark' ? 'text-white/70' : 'text-black/70'
	const bulletColor = scheme === 'dark' ? 'text-green-400' : 'text-green-600'

	return (
		<MotiView
			from={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ type: 'timing', duration: 300 }}
		>
			<Box className={`rounded-2xl px-5 py-6 mb-6 ${cardColor} shadow-sm`}>
				<Box className="items-center justify-center mb-4">
					<Box className="bg-white p-3 rounded-full shadow-sm">
						<Text className={`${iconSize} ${textColor}`}>{icon}</Text>
					</Box>
				</Box>
				<Text className={`text-lg font-semibold text-center mb-2 ${textColor}`}>
					{title}
				</Text>

				{description && (
					<Text className={`text-sm text-center ${subTextColor} mb-4`}>
						{description}
					</Text>
				)}
				<Box className="mb-4 space-y-2">
					{bullets.map((item) => (
						<Box
							key={item.replace(/\s+/g, '-').toLowerCase()}
							className="flex-row items-start space-x-2"
						>
							<Text
								className={`${bulletColor} text-base`}
								accessibilityLabel="Checkmark"
							>
								✓
							</Text>
							<Text
								className={`text-sm ${subTextColor} flex-1`}
								accessibilityRole="text"
							>
								{item}
							</Text>
						</Box>
					))}
				</Box>
				<Pressable
					onPress={onLearnMore}
					android_ripple={{ color: '#ddd' }}
					style={({ pressed }) => (pressed ? { opacity: 0.8 } : {})}
				>
					<Text className="text-sm font-medium text-center text-primary-600 underline">
						Learn More →
					</Text>
				</Pressable>
			</Box>
		</MotiView>
	)
}
