import { Text, TouchableOpacity, View } from 'react-native'

export default function SharePanel() {
	return (
		<View className="mt-8 mb-6">
			<Text className="font-bold mb-2">Share this opportunity</Text>
			<Text className="text-gray-600 mb-4">
				Help spread the word about this project
			</Text>

			<View className="flex-row space-x-6">
				<TouchableOpacity className="bg-gray-100 p-3 rounded-full mr-2">
					<Text>☞</Text>
				</TouchableOpacity>
				<TouchableOpacity className="bg-gray-100 p-3 rounded-full">
					<Text>☑</Text>
				</TouchableOpacity>
				<TouchableOpacity className="bg-gray-100 p-3 rounded">
					<Text>Share</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
