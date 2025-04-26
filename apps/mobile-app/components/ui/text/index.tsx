import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import * as React from 'react'
import {
	Platform,
	Text as RNText,
	type TextProps as RNTextProps,
} from 'react-native'
import { textStyle } from './styles'

type TextBaseProps = VariantProps<typeof textStyle> & {
	className?: string
}

type ITextProps = (Platform.OS extends 'web'
	? React.ComponentProps<'span'>
	: RNTextProps) &
	TextBaseProps

const Text = React.forwardRef<
	Platform.OS extends 'web' ? HTMLSpanElement : React.ElementRef<typeof RNText>,
	ITextProps
>((props, ref) => {
	const {
		className,
		isTruncated,
		bold,
		underline,
		strikeThrough,
		size = 'md',
		sub,
		italic,
		highlight,
		...rest
	} = props

	const styleClassName = textStyle({
		isTruncated,
		bold,
		underline,
		strikeThrough,
		size,
		sub,
		italic,
		highlight,
		class: className,
	})

	if (Platform.OS === 'web') {
		return (
			<span
				className={styleClassName}
				{...(rest as React.ComponentProps<'span'>)}
				ref={ref as React.Ref<HTMLSpanElement>}
			/>
		)
	}

	return (
		<RNText
			className={styleClassName}
			{...(rest as RNTextProps)}
			ref={ref as React.Ref<RNText>}
		/>
	)
})

Text.displayName = 'Text'

export { Text }
