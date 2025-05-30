import type { StyleProp, TextStyle } from 'react-native'

export function GradientText({
	children,
	style,
}: {
	children: React.ReactNode
	style?: StyleProp<TextStyle>
}) {
	return (
		<Text
			style={style}
			className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"
		>
			{children}
		</Text>
	)
}
