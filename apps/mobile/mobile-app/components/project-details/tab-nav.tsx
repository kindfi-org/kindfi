import { Link, useLocalSearchParams } from 'expo-router'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

export default function TabNav() {
	const { id } = useLocalSearchParams()
	const { tab = 'overview' } = useLocalSearchParams()

	const tabs = [
		{ name: 'Overview', value: 'overview' },
		{ name: 'Details', value: 'details' },
		{ name: 'Team', value: 'team' },
		{ name: 'Updates', value: 'updates' },
		{ name: 'Q&A', value: 'qna' },
	]

	return (
		<View className="border-b border-gray-200 pb-1">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 16 }}
			>
				<View className="flex-row items-center space-x-2">
					{tabs.map(({ name, value }) => (
						<Link key={value} href={`/project/${id}?tab=${value}`} asChild>
							<TouchableOpacity>
								<View
									className={`px-4 py-2 ${tab === value ? 'border border-gray-300 rounded-lg bg-gray-50' : ''}`}
								>
									<Text
										className={`text-sm ${tab === value ? 'font-semibold text-black' : 'font-medium text-gray-500'}`}
									>
										{name}
									</Text>
								</View>
							</TouchableOpacity>
						</Link>
					))}
				</View>
			</ScrollView>
		</View>
	)
}
