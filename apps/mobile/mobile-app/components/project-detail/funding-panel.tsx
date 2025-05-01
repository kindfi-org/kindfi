import { HR } from '@expo/html-elements'
import { MotiView } from 'moti'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function FundingPanel() {
	const progressPercentage = 53
	return (
		<View className="mt-6">
			<View className="flex-row justify-between items-center">
				<Text className="text-2xl font-bold">$40,000</Text>
				<Text className="text-lg text-gray-600">73%</Text>
			</View>
			<Text className="text-gray-600 mb-2">of $55,000 goal</Text>

			{/* Progress bar */}
			<View className="h-2 bg-gray-200 rounded-full w-full mb-4">
				<MotiView
					from={{ width: 0 }}
					animate={{ width: `${progressPercentage}%` }}
					transition={{ type: 'timing', duration: 1000 }}
					className="h-full bg-blue-500 rounded-full"
				/>
			</View>

			<View className="flex-row space-x-12 mb-4">
				<View>
					<Text className="text-gray-600">Investors</Text>
					<Text className="font-bold">40</Text>
				</View>
				<View>
					<Text className="text-gray-600">Min. Investment</Text>
					<Text className="font-bold">$10</Text>
				</View>
			</View>
			<View className="flex-row space-x-12 mb-4">
				<View>
					<Text className="text-gray-600">Closing Date</Text>
					<Text className="font-bold">14 days</Text>
				</View>
				<View>
					<Text className="text-gray-600">Type</Text>
					<Text className="font-bold">SAFE</Text>
				</View>
			</View>

			<View className="mb-4">
				<Text className="font-bold mb-2">Future Equity</Text>
				<Text className="text-gray-600">20 M $</Text>
				<Text className="text-gray-600 mt-1">
					Investors Advantages: 2mil $-10mil $
				</Text>
				<Text className="text-gray-600 mt-1">Valuation cap</Text>
			</View>

			<View className="flex-row items-center mb-4">
				<TextInput
					className="border border-gray-50 bg-gray-50 rounded-full px-3 py-2 flex-1"
					placeholder="$"
					keyboardType="numeric"
				/>
			</View>

			<TouchableOpacity className="bg-blue-600 py-3 rounded-lg mb-2">
				<Text className="text-white text-center font-bold">Invest</Text>
			</TouchableOpacity>

			<TouchableOpacity className="border border-gray-200 py-3 rounded-lg mb-8">
				<Text className="text-black text-center font-bold">
					Follow this project
				</Text>
			</TouchableOpacity>

			<HR />
		</View>
	)
}
