import * as ImagePicker from 'expo-image-picker'
import { Image as ImageIcon } from 'lucide-react-native'
import { type FC, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import { Box } from '../ui/box'
import { Text } from '../ui/text'

interface UploadImageProps {
	value?: string
	onChange?: (value: string) => void
	error?: boolean
	errorMessage?: string
}
const UploadImage: FC<UploadImageProps> = ({
	onChange,
	error,
	errorMessage,
}) => {
	const [image, setImage] = useState<ImagePicker.ImagePickerAsset>()

	const pickImageHandler = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 1,
		})

		if (!result.canceled) {
			setImage(result.assets[0])
			onChange(result.assets[0]?.uri)
		} else {
			alert('You did not select any image.')
		}
	}

	return (
		<Box className="w-full mt-8">
			<Box className="w-full">
				<Text className="font-normal text-sm text-black">
					Upload a project image
				</Text>
			</Box>

			<Box className="w-full mt-4">
				<TouchableOpacity
					onPress={pickImageHandler}
					style={[
						styles.uploadContainer,
						image ? styles.imageContainer : styles.placeholderContainer,
					]}
					className="w-full border rounded-xl justify-center items-center"
					activeOpacity={0.8}
				>
					{image ? (
						<Image
							source={{ uri: image.uri }}
							style={styles.uploadedImage}
							resizeMode="cover"
						/>
					) : (
						<>
							<ImageIcon size={30} color={'#00000080'} />
							<Box className="w-full mt-6">
								<Text className="text-center font-medium text-sm text-black mt-4">
									Click to upload
								</Text>
								<Text className="text-center font-medium text-sm text-[#000000B2] mt-2">
									PNG, JPG or GIF (max 5MB)
								</Text>
							</Box>
						</>
					)}
				</TouchableOpacity>
				{error && (
					<Box className=" w-full mt-2">
						<Text
							style={{
								color: 'red',
							}}
							className="font-normal text-left text-xs   "
						>
							{errorMessage}
						</Text>
					</Box>
				)}
			</Box>
		</Box>
	)
}

const styles = StyleSheet.create({
	uploadContainer: {
		borderStyle: 'dotted',
		overflow: 'hidden',
	},
	placeholderContainer: {
		paddingVertical: 32,
		height: 190,
	},
	imageContainer: {
		height: 190,
	},
	uploadedImage: {
		width: '100%',
		height: '100%',
	},
})

export default UploadImage
