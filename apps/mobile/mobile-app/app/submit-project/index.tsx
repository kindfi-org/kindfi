import { useFocusEffect, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SubmitProject = () => {
	const top = useSafeAreaInsets().top
	const router = useRouter()

	useFocusEffect(
		// biome-ignore lint/correctness/useExhaustiveDependencies: false
		useCallback(() => {
			router.replace('/submit-project/step-1-details')
		}, []),
	)
	return (
		<>
			<View
				style={{
					paddingTop: top,
				}}
				className={' flex-grow w-full  bg-[#F4F6FB] top-5'}
			/>
			<StatusBar backgroundColor="#F4F6FB" style="light" />
		</>
	)
}

export default SubmitProject
