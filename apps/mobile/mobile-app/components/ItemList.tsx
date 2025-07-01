import type React from 'react'
import {
	FlatList,
	Image,
	ImageSourcePropType,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import { getImageSource } from '../lib/utils'
import type { Item } from '../types'

interface ItemListProps {
	items: Item[]
}

const ItemList: React.FC<ItemListProps> = ({ items }) => {
	const renderItem = ({ item }: { item: Item }) => (
		<View style={styles.itemContainer}>
			<Image source={getImageSource(item.image)} style={styles.itemImage} />
			<Text style={styles.itemText}>{item.title}</Text>
		</View>
	)

	return (
		<FlatList
			data={items}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
			contentContainerStyle={styles.listContainer}
		/>
	)
}

const styles = StyleSheet.create({
	listContainer: {
		padding: 16,
	},
	itemContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	itemImage: {
		width: 50,
		height: 50,
		marginRight: 12,
	},
	itemText: {
		fontSize: 16,
	},
})

export default ItemList
