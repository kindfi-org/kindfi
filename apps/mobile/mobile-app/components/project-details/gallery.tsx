import { View } from 'react-native'
import EducationImage from '../../assets/images/education.svg'

export default function Gallery() {
	return (
		<View className="h-[30vh] w-full items-center justify-center">
			<EducationImage style={{ height: '100%' }} />
		</View>
	)
}
