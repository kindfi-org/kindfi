import { Image, View } from 'react-native'
import educationImage from '../../assets/images/education.webp'

export default function Gallery() {
	return (
		<View className="h-[30vh] w-full items-center justify-center">
			<Image source={educationImage} className="h-full" resizeMode="contain" />
		</View>
	)
}
