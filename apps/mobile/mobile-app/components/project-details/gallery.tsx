import { Image, View } from 'react-native'

export default function Gallery() {
	return (
		<View className="h-[30vh] w-full items-center justify-center">
			<Image
				source={require('../../assets/images/education.webp')}
				className="h-full"
				resizeMode="contain"
			/>
		</View>
	)
}
