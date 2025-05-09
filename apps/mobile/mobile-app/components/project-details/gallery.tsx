import { Image, View } from 'react-native'
import education from '../../assets/images/education.jpg'

export default function Gallery() {
	return (
		<View className="h-[30vh] w-full items-center justify-center">
			<Image source={education} className="h-full" resizeMode="contain" />
		</View>
	)
}
