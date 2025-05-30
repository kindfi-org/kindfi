import type { RouteProp } from '@react-navigation/native'
import React from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'

type ItemDetailsRouteParams = {
	item: {
		tags: string[]
		// Add other item properties as needed
	}
}

const ItemDetails = ({
	route,
}: {
	route: RouteProp<{ params: ItemDetailsRouteParams }, 'params'>
}) => {
	const { item } = route.params

	return (
		<ScrollView style={styles.container}>
			{/* Image Section */}
			<Image source={item.image} style={styles.image} />

			{/* Text Section */}
			<View style={styles.textContainer}>
				<Text style={styles.title}>{item.title}</Text>
				<Text style={styles.description}>{item.description}</Text>

				{/* Progress Section */}
				<View style={styles.progressContainer}>
					<Text style={styles.progressText}>
						{item.progress.amountRaised} ({item.progress.percentage} of{' '}
						{item.progress.goal})
					</Text>
				</View>

				{/* Stats Section */}
				<View style={styles.statsContainer}>
					<Text style={styles.stat}>Goal: {item.stats.goal}</Text>
					<Text style={styles.stat}>Investors: {item.stats.investors}</Text>
					<Text style={styles.stat}>
						Min. Investment: {item.stats.minInvestment}
					</Text>
				</View>

				{/* Tags Section */}
				<View style={styles.tagsContainer}>
					{item.tags.map((tag: string) => (
						<Text key={`tag-${tag}`} style={styles.tag}>
							{tag}
						</Text>
					))}
				</View>
			</View>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	image: {
		width: '100%',
		height: 300,
		resizeMode: 'cover',
	},
	textContainer: {
		padding: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	description: {
		fontSize: 16,
		color: '#6b7280',
		marginBottom: 16,
	},
	progressContainer: {
		marginBottom: 16,
	},
	progressText: {
		fontSize: 14,
		color: '#333',
	},
	statsContainer: {
		marginBottom: 16,
	},
	stat: {
		fontSize: 14,
		color: '#333',
		marginBottom: 8,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	tag: {
		backgroundColor: '#f3f4f6',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		fontSize: 12,
		color: '#333',
		marginRight: 8,
		marginBottom: 8,
	},
})

export default ItemDetails
