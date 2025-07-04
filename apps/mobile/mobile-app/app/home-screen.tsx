import { MotiView } from 'moti'
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native'
import HeroSection from '../components/hero/hero-section'
import LatamImpactSection from '../components/impact/latam-impact-section'
import MissionBlock from '../components/mission/mission-block'
import MobileNavbar from '../components/navbar/navbar-placeholder'

export default function HomeScreen() {
	return (
		<SafeAreaView className="flex-1 bg-white">
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
			<MotiView
				from={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ type: 'timing', duration: 500 }}
				className="flex-1"
			>
				<View className="flex-1">
					<ScrollView className="flex-1">
						<View className="pt-16">
							<HeroSection />
							<LatamImpactSection />
							<MissionBlock />
						</View>
					</ScrollView>
					<MobileNavbar />
				</View>
			</MotiView>
		</SafeAreaView>
	)
}
