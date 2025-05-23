import { Text, View } from 'react-native'

export default function Tags() {
	return (
		<View className="flex-row flex-wrap gap-2 mt-4">
			<Text className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
				Education
			</Text>
			<Text className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
				Children
			</Text>
			<Text className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
				Future
			</Text>
		</View>
	)
}
