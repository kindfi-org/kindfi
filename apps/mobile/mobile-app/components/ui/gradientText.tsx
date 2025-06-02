import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import type { StyleProp, TextStyle } from 'react-native'
import { Text as DefaultText } from 'react-native'

export function GradientText({
	children,
	style,
}: {
	children: React.ReactNode
	style?: StyleProp<TextStyle>
}) {
	return (
		<MaskedView
			maskElement={<DefaultText style={style}>{children}</DefaultText>}
		>
			<LinearGradient
				colors={['#000124', '#7CC635']} // Dark blue to light green
				start={{ x: 1, y: 0 }}
				end={{ x: 0, y: 0 }}
			>
				<DefaultText style={[style, { opacity: 0 }]}>{children}</DefaultText>
			</LinearGradient>
		</MaskedView>
	)
}
