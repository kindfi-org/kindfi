import { Dimensions, type ImageSourcePropType } from 'react-native'

export const getResponsiveLayout = () => {
	const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
	const isTablet = screenWidth >= 768
	const isLandscape = screenWidth > screenHeight

	// Dynamic padding based on screen size
	const CARD_PADDING = isTablet ? 32 : screenWidth < 375 ? 12 : 16
	const CARD_WIDTH = screenWidth - CARD_PADDING * 2

	return {
		screenWidth,
		CARD_PADDING,
		CARD_WIDTH,
		isTablet,
		isLandscape,
	}
}

export const getImageSource = (
	image: string | ImageSourcePropType,
): ImageSourcePropType => {
	if (typeof image === 'string') {
		return { uri: image } // Remote image
	}
	return image // Local image (e.g. require())
}
