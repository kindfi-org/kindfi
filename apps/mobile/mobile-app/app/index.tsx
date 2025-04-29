import ImpactSection from '@/components/impact/impact-section'
import React, { useState } from 'react'
import { ScrollView, StatusBar, View, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import KindFiOnboarding from '@/components/onboarding/Onboarding'
import { Text } from '@/components/ui/text'

export default function Home() {
	const insets = useSafeAreaInsets()
	const [showOnboarding, setShowOnboarding] = useState(true)

	return (
		<View className="flex-1 bg-background-light">
			<StatusBar
				barStyle="dark-content"
				backgroundColor="transparent"
				translucent={false}
			/>
			
			{/* Onboarding Modal */}
			<KindFiOnboarding
				isOpen={showOnboarding}
				onClose={() => setShowOnboarding(false)}
			/>
			
			<ScrollView
				style={{ height: '100%' }}
				contentContainerStyle={{
					flexGrow: 1,
					paddingTop: insets.top,
					paddingBottom: insets.bottom,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<ImpactSection />
				
				{/* Button to open modal */}
				<TouchableOpacity
						onPress={() => setShowOnboarding(true)}
						className="m-6 py-3 px-6 gradient-btn rounded-lg"
					>
						<Text className="text-white font-medium text-center">Show Onboarding</Text>
					</TouchableOpacity>
			</ScrollView>
		</View>
	)
}