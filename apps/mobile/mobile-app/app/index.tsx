import ImpactSection from '@/components/impact/impact-section'
import React from 'react'
import { ScrollView, StatusBar, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Home() {
	const insets = useSafeAreaInsets()

	return (
		<View className="flex-1 bg-background-light">
			<StatusBar
				barStyle="dark-content"
				backgroundColor="transparent"
				translucent={false}
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
			</ScrollView>
		</View>
	)
}
