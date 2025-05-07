import { Text, View } from 'react-native'

export default function Overview() {
	const items = [
		'40% - Direct project implementation',
		'25% - Community outreach and education',
		'20% - Materials and equipment',
		'10% - Administrative expenses',
		'5% - Contingency fund',
	]

	return (
		<View className="mt-4">
			<Text className="text-lg font-bold mb-2">About This Project</Text>
			<Text className="text-gray-600 mb-6">
				Support education programs for children in low-income areas. Together,
				we can bridge the education gap and create opportunities for the next
				generation..
			</Text>
			<Text className="text-gray-600 mb-6">
				This project aims to create a sustainable and impactful solution for our
				community. With your support, we can achieve our goals and make a real
				difference.
			</Text>

			<Text className="text-lg font-bold mb-2">Our Mission</Text>
			<Text className="text-gray-600">
				We're dedicated to providing innovative solutions that address key
				challenges in our field. Our team brings together expertise and passion
				to ensure successful outcomes.
			</Text>
			<Text className="text-lg font-bold mb-2 mt-3">
				How Funds Will Be Used
			</Text>
			{items.map((item, index) => (
				<View key={index} style={{ flexDirection: 'row', marginBottom: 8 }}>
					<Text style={{ marginRight: 8 }}>•</Text>
					<Text style={{ fontSize: 16 }}>{item}</Text>
				</View>
			))}
		</View>
	)
}
