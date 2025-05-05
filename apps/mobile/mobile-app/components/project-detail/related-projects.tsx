import { Text, TouchableOpacity, View } from 'react-native'

export default function RelatedProjects() {
	const projects = [
		{
			id: '1',
			name: 'EcoFlow Energy Solutions',
			description: 'Renewable energy storage for residential',
			raised: '1.2M Raised',
			progress: '80%',
		},
		{
			id: '2',
			name: 'GreenPower Storage Systems',
			description: 'Grid-scale energy storage technology',
			raised: '1.2M Raised',
			progress: '57%',
		},
	]

	return (
		<View className="mt-8 mb-10 px-4">
			<Text className="font-bold text-lg mb-4">Similar Projects</Text>

			<View className="space-y-4">
				{' '}
				{/* Vertical spacing between items */}
				{projects.map((project) => (
					<TouchableOpacity
						key={project.id}
						className="bg-gray-50 p-4 rounded-lg"
					>
						<Text className="font-bold mb-1">{project.name}</Text>
						<Text className="text-gray-600 text-sm mb-2">
							{project.description}
						</Text>
						<View className="flex-row justify-between items-center">
							<Text className="text-sm font-medium">{project.raised}</Text>
							{project.progress && (
								<Text className="text-sm text-gray-600">
									{project.progress}
								</Text>
							)}
						</View>
					</TouchableOpacity>
				))}
				<TouchableOpacity className="bg-gray-50 p-4 rounded-lg items-center justify-center mt-4">
					<Text className="text-blue-600 font-medium">View more</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
