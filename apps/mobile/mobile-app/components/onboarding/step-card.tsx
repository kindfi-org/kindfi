import { MotiView } from 'moti'
import { Dimensions, View } from 'react-native'
import { HStack } from '../ui/hstack'
import { Text } from '../ui/text'
import { VStack } from '../ui/vstack'

interface StepCardProps {
	step: {
		number: number
		title: string
		description: string
	}
	index: number
	total: number
	currentIndex: number
}

export function StepCard({ step, index, total, currentIndex }: StepCardProps) {
	const screenHeight = Dimensions.get('window').height

	return (
		<View
			style={{ height: screenHeight }}
			className="justify-center items-center"
		>
			<MotiView
				from={{ opacity: 0, translateY: 20 }}
				animate={{ opacity: 1, translateY: 0 }}
				transition={{
					type: 'timing',
					duration: 300,
					delay: index * 100,
				}}
				className="items-center justify-center px-6"
				style={{ height: screenHeight * 0.9 }}
			>
				<View className="w-full h-[20rem] flex flex-col items-center justify-center   bg-white dark:bg-gray-800  rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
					<HStack space="md" className="items-start">
						<View className="bg-blue-100 dark:bg-blue-900 rounded-full w-8 h-8 items-center justify-center mt-1">
							<Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">
								{step.number}
							</Text>
						</View>

						<VStack space="xs" className="flex-1">
							<Text className="text-3xl font-bold text-gray-900 dark:text-white">
								{step.title}
							</Text>
							<Text className="text-lg text-gray-600 dark:text-gray-300">
								{step.description}
							</Text>
						</VStack>
					</HStack>
				</View>

				<View className="flex-row justify-center mt-[5rem]">
					{Array.from({ length: total }).map((_, i) => (
						<View
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={i}
							className={`h-3 w-3 mx-1 rounded-full ${
								i === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
							}`}
						/>
					))}
				</View>
			</MotiView>
		</View>
	)
}
