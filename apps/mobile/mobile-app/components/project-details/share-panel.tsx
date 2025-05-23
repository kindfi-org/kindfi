import { Link2, Share, SquareArrowOutUpRight } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'

export default function SharePanel() {
	return (
		<View className="mt-8 mb-6">
			<Text className="font-bold mb-2">Share this opportunity</Text>
			<Text className="text-gray-600 mb-4">
				Help spread the word about this project
			</Text>

			<View className="flex-row justify-between">
				<TouchableOpacity className="border p-3 rounded-full mr-2">
					<Link2 />
				</TouchableOpacity>
				<TouchableOpacity className="border p-3 rounded-full">
					<SquareArrowOutUpRight />
				</TouchableOpacity>
				<TouchableOpacity className="border px-12 py-3 rounded flex-row items-center gap-2">
					<Share size={16} />
					<Text>Share</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
