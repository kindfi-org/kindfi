import type { ImageSourcePropType } from 'react-native'

export interface Project {
	id: string
	title: string
	description: string
	imageUrl: string
	category: string
	image: ImageSourcePropType
	text: string
}

export interface FilterOption {
	id: string
	label: string
}
