import { AnimatePresence, MotiView } from 'moti'
import type { FC } from 'react'
import type { KeyboardType, ViewStyle } from 'react-native'
import { TextInput } from 'react-native'
import type { StyleAttribute } from 'react-native-css-interop/dist/types'
import { Box } from '../ui/box'
import { Text } from '../ui/text'
import { Textarea, TextareaInput } from '../ui/textarea'

interface InputFieldProps {
	value?: string | undefined
	onChange?: (value: string) => void
	keyboardType?: KeyboardType
	onBlur?: () => void
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	inputRef?: React.Ref<any>
	borderColor?: string
	className?: StyleAttribute
	infoText?: string
	placeHolder?: string
	placeHolderColor?: string
	label?: string
	style?: ViewStyle
	textArea?: boolean
	errorMessage?: string
	error?: boolean
}

function generateLighterColor(hex: string): string {
	const normalized = hex.toLowerCase()
	if (normalized === '#5970a6') {
		return '#F4F6FB'
	}

	const cleanHex = normalized.replace('#', '')
	if (cleanHex.length !== 6) return '#f0f0f0'

	const r = Number.parseInt(cleanHex.slice(0, 2), 16)
	const g = Number.parseInt(cleanHex.slice(2, 4), 16)
	const b = Number.parseInt(cleanHex.slice(4, 6), 16)

	const lighten = (channel: number) =>
		Math.round(channel + (255 - channel) * 0.85)

	const newR = lighten(r)
	const newG = lighten(g)
	const newB = lighten(b)

	return `rgb(${newR}, ${newG}, ${newB})`
}

const InputField: FC<InputFieldProps> = ({
	value,
	onChange,
	inputRef,
	onBlur,
	keyboardType,
	borderColor,
	className,
	placeHolder,
	placeHolderColor,
	label,
	style,
	infoText,
	textArea = false,
	error,
	errorMessage,
}) => {
	const lightBg = generateLighterColor(borderColor || '#F4F6FB')

	return (
		// <MotiView
		//   from={{ opacity: 0, translateY: 20 }}
		//   animate={{ opacity: 1, translateY: 0 }}
		//   transition={{ type: "timing", duration: 400 }}
		// >
		<Box className={`${className} w-full`}>
			<Box className="w-full">
				<Text className=" text-sm font-normal text-black text-left">
					{label}
				</Text>
			</Box>

			<Box className="w-full mt-4">
				{textArea ? (
					<Textarea
						size="md"
						isReadOnly={false}
						isInvalid={false}
						isDisabled={false}
						style={{
							borderColor: error ? 'red' : borderColor || '#5970A6',
							backgroundColor: borderColor ? lightBg : '#F4F6FB',
							borderWidth: 1,
							borderRadius: 10,
							paddingHorizontal: 16,
							minHeight: 96,
							paddingVertical: 12,
						}}
					>
						<TextareaInput
							keyboardType={keyboardType}
							onChangeText={(text) => onChange?.(text)}
							value={value}
							style={{ color: '#000' }}
							onBlur={onBlur}
							ref={inputRef}
							placeholder={placeHolder}
							placeholderTextColor={placeHolderColor}
						/>
					</Textarea>
				) : (
					<TextInput
						keyboardType={keyboardType}
						onChangeText={(text) => onChange?.(text)}
						value={value}
						onBlur={onBlur}
						ref={inputRef}
						placeholder={placeHolder}
						placeholderTextColor={placeHolderColor}
						style={{
							borderColor: error ? 'red' : borderColor || '#5970A6',
							backgroundColor: borderColor ? lightBg : '#F4F6FB',
							borderWidth: 1,
							borderRadius: 10,
							paddingHorizontal: 16,
							paddingVertical: 12,
						}}
					/>
				)}
			</Box>

			<AnimatePresence>
				{error && (
					<MotiView
						from={{ opacity: 0, translateY: -4 }}
						animate={{ opacity: 1, translateY: 0 }}
						exit={{ opacity: 0, translateY: -4 }}
						transition={{ type: 'timing', duration: 300 }}
					>
						<Box className="w-full mt-2">
							<Text
								style={{ color: 'red' }}
								className="font-normal text-left text-xs"
							>
								{errorMessage}
							</Text>
						</Box>
					</MotiView>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{infoText && !error && (
					<MotiView
						from={{ opacity: 0, translateY: -4 }}
						animate={{ opacity: 1, translateY: 0 }}
						exit={{ opacity: 0, translateY: -4 }}
						transition={{ type: 'timing', duration: 300 }}
					>
						<Box className="w-full mt-4">
							<Text className="font-normal text-left text-xs text-black">
								{infoText}
							</Text>
						</Box>
					</MotiView>
				)}
			</AnimatePresence>
		</Box>
		// </MotiView>
	)
}

export default InputField
