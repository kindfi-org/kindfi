import { AnimatePresence, MotiView } from 'moti'
import { type FC, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Box } from '../ui/box'
import { HStack } from '../ui/hstack'
import { Text } from '../ui/text'

interface CategorySelectorProps {
	onValueChange: (category: string) => void
	error?: boolean
	errorMessage?: string
}

const CategorySelector: FC<CategorySelectorProps> = ({
	onValueChange,
	error,
	errorMessage,
}) => {
	const categories = [
		{
			title: 'Environment',
			bgColor: '#E0F2F1',
			textColor: '#004D40',
		},
		{
			title: 'Education',
			bgColor: '#E3F2FD',
			textColor: '#4B5563',
		},
		{
			title: 'Healthcare',
			bgColor: '#FFEBEE',
			textColor: '#B71C1C',
		},
		{
			title: 'Technology',
			bgColor: '#E8F5E9',
			textColor: '#1B5E20',
		},
		{
			title: 'Community',
			bgColor: '#FFF3E0',
			textColor: '#E65100',
		},
		{
			title: 'Arts',
			bgColor: '#F3E5F5',
			textColor: '#4A148C',
		},
	]

	const [selectedCategory, setSelectedCategory] = useState<string>('')

	const onSelectHandler = (category: string) => {
		setSelectedCategory(category)
		onValueChange(category)
	}

	return (
		<MotiView
			from={{ opacity: 0, translateY: 20 }}
			animate={{ opacity: 1, translateY: 0 }}
			transition={{ type: 'timing', duration: 400 }}
		>
			<Box className="w-full mt-8">
				<Text className="text-sm font-normal text-black text-left">
					How would you categorize our project?
				</Text>

				<HStack className="w-full items-center justify-start gap-3 flex-wrap mt-4">
					{categories.map((item, index) => {
						const { title, textColor, bgColor } = item
						const isSelected = title === selectedCategory

						return (
							<MotiView
								key={index.toString()}
								from={{ opacity: 0, translateY: 10 }}
								animate={{ opacity: 1, translateY: 0 }}
								transition={{
									delay: index * 70,
									type: 'timing',
									duration: 300,
								}}
							>
								<TouchableOpacity
									onPress={() => onSelectHandler(title)}
									style={{
										backgroundColor: bgColor,
										borderColor: isSelected ? textColor : 'transparent',
										borderWidth: isSelected ? 1 : 0,
										transform: [{ scale: isSelected ? 1.05 : 1 }],
									}}
									className="w-auto max-w-36 min-w-24 rounded-md py-2 px-4 flex items-center justify-center gap-2"
								>
									<Text
										style={{ color: textColor }}
										className="font-normal text-sm"
									>
										{title}
									</Text>
								</TouchableOpacity>
							</MotiView>
						)
					})}
				</HStack>

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
			</Box>
		</MotiView>
	)
}

export default CategorySelector
