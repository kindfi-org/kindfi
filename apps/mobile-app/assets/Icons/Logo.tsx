import type React from 'react'
import type { ViewStyle } from 'react-native'
import { Defs, LinearGradient, Path, Rect, Stop, Svg } from 'react-native-svg'

interface LogoProps {
	width?: number | string
	height?: number | string
	style?: ViewStyle
}

const Logo: React.FC<LogoProps> = ({
	width = '100%',
	height = '100%',
	style,
}) => {
	return (
		<Svg
			width={width}
			height={height}
			viewBox="0 0 188 31"
			fill="none"
			style={style}
			preserveAspectRatio="xMidYMid meet"
		>
			<Rect
				y="1.40527"
				width="27.9999"
				height="27.1895"
				rx="2.79998"
				fill="url(#paint0_linear_10988_36724)"
			/>
			<Path
				d="M7 13.5614L13.9999 8.40527V10.8386L7 15.9947V13.5614Z"
				fill="white"
			/>
			<Path
				d="M21 13.5615L14.0001 8.40533V10.8386L21 15.9948V13.5615Z"
				fill="white"
			/>
			<Path
				d="M7 19.1614L13.9999 14.0052V16.4386L7 21.5947V19.1614Z"
				fill="white"
			/>
			<Path
				d="M20.999 19.1615L13.9992 14.0054V16.4387L20.999 21.5948V19.1615Z"
				fill="white"
			/>
			<Defs>
				<LinearGradient
					id="paint0_linear_10988_36724"
					x1="14"
					y1="1.40527"
					x2="31.1111"
					y2="30.6386"
					gradientUnits="userSpaceOnUse"
				>
					<Stop stopColor="#4AA9FF" />
					<Stop offset="1" stopColor="#004282" />
				</LinearGradient>
			</Defs>
		</Svg>
	)
}

export default Logo
