import type { ImageSourcePropType } from 'react-native'

export interface Item {
	id: string
	title: string
	imageUrl: string
	category: string
	image: string | ImageSourcePropType
	text: string
}

export interface FilterOption {
	id: string
	label: string
}
