import { Ionicons } from '@expo/vector-icons'
import type React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import type { ImageSourcePropType } from 'react-native'

interface HeaderProps {
	logo: ImageSourcePropType
}

const Header: React.FC<HeaderProps> = ({ logo }) => {
	return (
		<View style={styles.container}>
			<Image source={logo} style={styles.logo} />
			<Ionicons name="menu" size={30} color="black" />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		backgroundColor: '#fff',
	},
	logo: {
		width: 50,
		height: 50,
	},
	hamburgerIcon: {
		width: 30,
		height: 30,
	},
})

export default Header
