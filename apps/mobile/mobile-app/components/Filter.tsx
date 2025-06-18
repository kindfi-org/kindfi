import type React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface FilterProps {
	filterItems: string[]
	onFilterSelect: (filter: string) => void
}

const Filter: React.FC<FilterProps> = ({ filterItems, onFilterSelect }) => {
	return (
		<View style={styles.container}>
			{filterItems.map((item) => (
				<TouchableOpacity
					key={item}
					onPress={() => onFilterSelect(item)}
					style={styles.filterButton}
				>
					<Text style={styles.filterText}>{item}</Text>
				</TouchableOpacity>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 10,
		backgroundColor: '#f8f8f8',
	},
	filterButton: {
		padding: 10,
		borderRadius: 5,
		backgroundColor: '#e0e0e0',
	},
	filterText: {
		fontSize: 16,
	},
})

export default Filter
