import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export const allItems = [
	{
		id: '1',
		category: 'animal welfare',
		image: require('../assets/images/artesania.webp'),
		text: 'Animal Welfare 1',
		title: 'Healthy Kids Workshop',
		description:
			'Provide nourishing meals and support to children at risk of malnutrition in Costa Rica. Together, we can ensure a brighter future for every child.',
		progress: {
			amountRaised: '$22,800',
			percentage: '90%',
			goal: '$25,000',
		},
		stats: {
			goal: '$25,000',
			investors: 18,
			minInvestment: '$5',
		},
		tags: ['NGO', 'NUTRITION', 'CHILDREN'],
	},
	{
		id: '2',
		category: 'animal welfare',
		image: require('../assets/images/bosques.webp'),
		text: 'Animal Welfare 2',
		title: 'Animal Shelter Support',
		description:
			'Help provide food, shelter, and medical care to abandoned animals in need. Your contribution makes a difference.',
		progress: {
			amountRaised: '$15,000',
			percentage: '60%',
			goal: '$25,000',
		},
		stats: {
			goal: '$25,000',
			investors: 12,
			minInvestment: '$10',
		},
		tags: ['ANIMALS', 'WELFARE'],
	},
	{
		id: '3',
		category: 'environment',
		image: require('../assets/images/education.webp'),
		text: 'Environment 1',
		title: 'Tree Planting Initiative',
		description:
			'Join us in planting trees to combat deforestation and promote a greener planet. Every tree counts!',
		progress: {
			amountRaised: '$10,000',
			percentage: '40%',
			goal: '$25,000',
		},
		stats: {
			goal: '$25,000',
			investors: 25,
			minInvestment: '$20',
		},
		tags: ['ENVIRONMENT', 'TREES'],
	},
	{
		id: '4',
		category: 'environment',
		image: require('../assets/images/healthcare.webp'),
		text: 'Environment 2',
		title: 'Clean Water Project',
		description:
			'Provide access to clean and safe drinking water for communities in need. Together, we can save lives.',
		progress: {
			amountRaised: '$18,000',
			percentage: '72%',
			goal: '$25,000',
		},
		stats: {
			goal: '$25,000',
			investors: 30,
			minInvestment: '$15',
		},
		tags: ['WATER', 'HEALTH'],
	},
	{
		id: '5',
		category: 'animal welfare, environment',
		image: require('../assets/images/healthcare.webp'),
		text: 'Animal & Environment',
		title: 'Wildlife Conservation',
		description:
			'Support efforts to protect endangered species and their habitats. Your help ensures a sustainable future.',
		progress: {
			amountRaised: '$20,000',
			percentage: '80%',
			goal: '$25,000',
		},
		stats: {
			goal: '$25,000',
			investors: 22,
			minInvestment: '$50',
		},
		tags: ['WILDLIFE', 'CONSERVATION'],
	},
]

export const ItemList = ({ items }: { items: typeof allItems }) => (
	<View style={styles.itemList}>
		{items.map((item) => (
			<TouchableOpacity key={item.id} style={styles.card}>
				{/* Image Section */}
				<View style={styles.imageContainer}>
					<Image source={item.image} style={styles.image} />
				</View>

				{/* Text Section */}
				<View style={styles.textContainer}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.description}>{item.description}</Text>

					{/* Progress Section */}
					<View style={styles.progressContainer}>
						<View style={styles.progressTextContainer}>
							<Text style={styles.progressAmount}>
								{item.progress.amountRaised}
							</Text>
							<Text style={styles.progressPercentage}>
								{item.progress.percentage} of {item.progress.goal}
							</Text>
						</View>
						<View style={styles.progressBarBackground}>
							<View
								style={[
									styles.progressBarFill,
									{ width: `${Number.parseFloat(item.progress.percentage)}%` },
								]}
							/>
						</View>
					</View>

					{/* Stats Section */}
					<View style={styles.statsContainer}>
						<View style={styles.stat}>
							<Text style={styles.statValue}>{item.stats.goal}</Text>
							<Text style={styles.statLabel}>Goal</Text>
						</View>
						<View style={styles.stat}>
							<Text style={styles.statValue}>{item.stats.investors}</Text>
							<Text style={styles.statLabel}>Investors</Text>
						</View>
						<View style={styles.stat}>
							<Text style={styles.statValue}>{item.stats.minInvestment}</Text>
							<Text style={styles.statLabel}>Min. Investment</Text>
						</View>
					</View>

					{/* Tags Section */}
					<View style={styles.tagsContainer}>
						{item.tags.map((tag, index) => (
							<Text key={index} style={styles.tag}>
								{tag}
							</Text>
						))}
					</View>
				</View>
			</TouchableOpacity>
		))}
	</View>
)

const styles = StyleSheet.create({
	itemList: {
		padding: 16,
	},
	card: {
		overflow: 'hidden',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		backgroundColor: '#fff',
		marginBottom: 16,
	},
	imageContainer: {
		width: '100%',
		height: 192,
		position: 'relative',
	},
	image: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	textContainer: {
		padding: 20,
		flex: 1,
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 8,
	},
	description: {
		color: '#6b7280',
		marginBottom: 16,
		fontSize: 14,
		lineHeight: 20,
	},
	progressContainer: {
		marginBottom: 16,
	},
	progressTextContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	progressAmount: {
		fontWeight: '600',
	},
	progressPercentage: {
		color: '#9ca3af',
	},
	progressBarBackground: {
		width: '100%',
		height: 8,
		backgroundColor: '#f3f4f6',
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressBarFill: {
		width: '90%',
		height: '100%',
		backgroundColor: '#7CC635',
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	stat: {
		alignItems: 'center',
	},
	statValue: {
		fontWeight: '600',
	},
	statLabel: {
		fontSize: 12,
		color: '#9ca3af',
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 16,
	},
	tag: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		fontSize: 10,
		textTransform: 'uppercase',
		borderRadius: 4,
		backgroundColor: '#f3f4f6',
	},
})
